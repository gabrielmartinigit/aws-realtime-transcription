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
                    <img alt="aws architecture" src={Diagram} className="center"></img>
                </Container>
            </Grid>
            <Container>
                <Grid item xs={12}>
                    <ExpandableSection header="Descrição">
                        <Text variant='p'>
                            Arquitetura de demosntração para app web com feature de transcrição de áudio (arquivos .mp3). A API em Flask é responsável por efetuar as chamadas para o serviço Amazon Transcribe.
                            <br />
                            Estimativa da transcrição na região de São Paulo. O valor está em USD$ para 10K minutos (~166 horas) por mês: <a target="_blank" href="https://calculator.aws/#/estimate?id=f3d2a43503dbb49089cb5c577b1beac6a8fe9727">calculadora AWS</a>
                        </Text>
                    </ExpandableSection>
                </Grid>
            </Container>
        </Grid>
    );
}

export default Architecture;