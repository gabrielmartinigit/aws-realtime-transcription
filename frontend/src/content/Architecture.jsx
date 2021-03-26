import Container from 'aws-northstar/layouts/Container';
import ExpandableSection from 'aws-northstar/components/ExpandableSection';
import Grid from 'aws-northstar/layouts/Grid';
import Text from 'aws-northstar/components/Text';
import Diagram from '../images/arquitetura.jpg';
import '../styles/global.css';

function Architecture() {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Container
                    title="Arquitetura"
                    subtitle="Arquitetura cloud da solução"
                >
                    <img src={Diagram} className="center"></img>
                    <ExpandableSection header="Descrição">
                        <Text variant='p'>
                            <ol>
                                <li>
                                    Acesso ao frontend:
                                </li>
                                <li>
                                    Requisição para API backend:
                                </li>
                                <li>
                                    Início da transcrição:
                                </li>
                                <li>
                                    Armazenamento:
                                </li>
                            </ol>
                        </Text>
                    </ExpandableSection>
                </Container>
            </Grid>
        </Grid>
    );
}

export default Architecture;