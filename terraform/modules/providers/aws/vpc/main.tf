// Provision VPC stack

data "aws_availability_zones" "all" {}

resource "aws_vpc" "vpc" {
  cidr_block = var.cidr_vpc

  enable_dns_hostnames = true
  enable_dns_support   = true
  instance_tenancy     = "default"

  tags = {
    Name        = var.vpc_name
    Environment = var.environment
  }
}

resource "aws_subnet" "private_subnet" {
  vpc_id                  = aws_vpc.vpc.id
  count                   = var.subnet_count
  cidr_block              = cidrsubnet(var.cidr_vpc, var.cidr_network_bits, count.index)
  availability_zone       = element(data.aws_availability_zones.all.names, count.index)
  map_public_ip_on_launch = false

  tags = {
    Name        = "private-${var.vpc_name}-${element(data.aws_availability_zones.all.names, count.index)}-subnet"
    Environment = var.environment
  }

  depends_on = [aws_vpc.vpc]
}

resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.vpc.id
  count                   = var.subnet_count
  cidr_block              = cidrsubnet(var.cidr_vpc, var.cidr_network_bits, (count.index + length(split(",", lookup(var.azs, var.region)))))
  availability_zone       = element(data.aws_availability_zones.all.names, count.index)
  map_public_ip_on_launch = true

  tags = {
    Name        = "public-${var.vpc_name}-${element(data.aws_availability_zones.all.names, count.index)}-subnet"
    Environment = var.environment
  }

  depends_on = [aws_vpc.vpc]
}

resource "aws_internet_gateway" "internet_gateway" {
  vpc_id     = aws_vpc.vpc.id
  depends_on = [aws_vpc.vpc]

  tags = {
    Environment = var.environment
  }
}

resource "aws_eip" "nat_gateway_eip" {
  count      = var.subnet_count
  vpc        = true
  depends_on = [aws_internet_gateway.internet_gateway]

  tags = {
    Environment = var.environment
  }
}

resource "aws_nat_gateway" "nat_gateway" {
  count         = var.subnet_count
  allocation_id = aws_eip.nat_gateway_eip.*.id[count.index]
  subnet_id     = aws_subnet.public_subnet.*.id[count.index]
  depends_on    = [aws_internet_gateway.internet_gateway, aws_subnet.public_subnet]

  tags = {
    Environment = var.environment
  }
}

resource "aws_route_table" "public" {
  count  = var.subnet_count
  vpc_id = aws_vpc.vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.internet_gateway.id
  }

  tags = {
    Name        = "${var.vpc_name}-route_table_public"
    Environment = var.environment
  }
}

resource "aws_route_table" "private" {
  count  = var.subnet_count
  vpc_id = aws_vpc.vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = element(aws_nat_gateway.nat_gateway.*.id, count.index)
  }

  tags = {
    Name        = "${var.vpc_name}-route_table_private"
    Environment = var.environment
  }
}

resource "aws_route_table_association" "public_assoc" {
  count          = length(split(",", lookup(var.azs, var.region)))
  subnet_id      = element(aws_subnet.public_subnet.*.id, count.index)
  route_table_id = element(aws_route_table.public.*.id, count.index)
}

resource "aws_route_table_association" "private_assoc" {
  count          = var.subnet_count
  subnet_id      = element(aws_subnet.private_subnet.*.id, count.index)
  route_table_id = element(aws_route_table.private.*.id, count.index)
}

resource "aws_security_group" "vpc_security_group" {
  name   = "aws-${var.vpc_name}-vpc-sg"
  vpc_id = aws_vpc.vpc.id

  tags = {
    Environment = var.environment
  }
}

resource "aws_security_group_rule" "allow_ssh_internal" {
  type        = "ingress"
  from_port   = 22
  to_port     = 22
  protocol    = "tcp"
  cidr_blocks = [var.cidr_vpc]

  security_group_id = aws_security_group.vpc_security_group.id
}

resource "aws_security_group_rule" "egress_allow_all" {
  type        = "egress"
  from_port   = 0
  to_port     = 65535
  protocol    = "all"
  cidr_blocks = ["0.0.0.0/0"]

  security_group_id = aws_security_group.vpc_security_group.id
}

// END of VPC
