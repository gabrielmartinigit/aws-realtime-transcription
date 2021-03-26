import React from 'react';
import Grid from 'aws-northstar/layouts/Grid';
import Container from 'aws-northstar/layouts/Container';
import Form from 'aws-northstar/components/Form';
import FormField from 'aws-northstar/components/FormField'
import Input from 'aws-northstar/components/Input';
import Textarea from 'aws-northstar/components/Textarea';
import Button from 'aws-northstar/components/Button';
import Inline from 'aws-northstar/layouts/Inline';
import StatusIndicator from 'aws-northstar/components/StatusIndicator';
import Table from 'aws-northstar/components/Table';
import DatePicker from 'aws-northstar/components/DatePicker';
import { EventStreamMarshaller, Message } from '@aws-sdk/eventstream-marshaller';
import { toUtf8, fromUtf8 } from '@aws-sdk/util-utf8-node';
import mic from 'microphone-stream';
import Axios from 'axios';

function Telemetry() {
    const columnDefinitions = [
        {
            id: 'id',
            width: 200,
            Header: 'Id',
            accessor: 'id'
        },
        {
            id: 'status',
            width: 200,
            Header: 'Status',
            accessor: 'status',
            Cell: ({ row }) => {
                if (row && row.original) {
                    const status = row.original.status;
                    switch (status) {
                        case 'active':
                            return <StatusIndicator statusType='positive'>transcrito</StatusIndicator>;
                        case 'inactive':
                            return <StatusIndicator statusType='negative'>intranscrito</StatusIndicator>;
                        default:
                            return null;
                    }
                }
                return null;
            }
        }
    ];

    const data = [
        {
            id: 'id0000001',
            status: 'inactive'
        }
    ];

    const tableActions = (
        <Inline>
            <Button variant="primary">
                Iniciar
            </Button>
            <Button variant="link">
                Atualizar
            </Button>
            <Button variant='link'>
                Adicionar
            </Button>
        </Inline>
    );

    return (
        <Grid container spacing={3}>
            <Grid item xs={7}>
                <Container
                    title="Transcrição"
                    subtitle="Tempo real"
                >
                    <FormField controlId="formFieldId2">
                        <Textarea controlId="formFieldId2" />
                    </FormField>
                    <Inline>
                        <Button variant="primary">Iniciar</Button>
                        <Button variant="link">Adicionar</Button>
                    </Inline>
                </Container>
            </Grid>
            <Grid item xs={5}>
                <Container
                    title="Formulário"
                    subtitle="Preenchimento de meta-dados para a transcrição. Ao cliclar em salvar, a transcrição e os meta-dados serão salvos."
                >
                    <Form
                        actions={
                            <Inline>
                                <Button variant="primary">Salvar</Button>
                                <Button variant="link">Cancelar</Button>
                            </Inline>
                        }>
                        <FormField label="Data" controlId="formFieldId1">
                            <DatePicker />
                        </FormField>
                        <FormField label="Autor" controlId="formFieldId1">
                            <Input type="text" controlId="formFieldId1" />
                        </FormField>
                        <FormField label="Pauta" hintText="Até 200 caracteres." controlId="formFieldId1">
                            <Input type="text" controlId="formFieldId1" />
                        </FormField>
                    </Form>
                </Container>
            </Grid>
            <Grid item xs={12}>
                <Container
                    title="Transcrição"
                    subtitle="Assíncrona"
                >
                    <Table
                        actionGroup={tableActions}
                        tableTitle='Áudios disponíveis'
                        disableFilters={true}
                        multiSelect={true}
                        columnDefinitions={columnDefinitions}
                        items={data}
                        getRowId={React.useCallback(data => data.id, [])}
                    />
                </Container>
            </Grid>
            <Grid item xs={12}>
                <Container
                    title="Segmentos"
                    subtitle="Recortes do texto corrigido"
                >
                </Container>
            </Grid>
        </Grid >
    );
}

export default Telemetry;