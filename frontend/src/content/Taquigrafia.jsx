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

function Taquigrafia() {
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
        },
        {
            id: 'id0000002',
            status: 'inactive'
        }
    ];

    const tableActionsAudio = (
        <Inline>
            <Button variant="primary">
                Iniciar
            </Button>
            <Button variant='link'>
                Adicionar
            </Button>
        </Inline>
    );

    const tableActionsTrans = (
        <Inline>
            <Button variant="primary">
                Editar
            </Button>
            <Button variant="link">
                Excluir
            </Button>
        </Inline>
    );

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Table
                    actionGroup={tableActionsAudio}
                    tableTitle='Áudios disponíveis'
                    multiSelect={true}
                    columnDefinitions={columnDefinitions}
                    items={data}
                    getRowId={React.useCallback(data => data.id, [])}
                />
            </Grid>
            <Grid item xs={12}>
                <Container
                    title="Segmentos"
                    subtitle="Recortes do texto transcrito"
                >
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
                            <Textarea />
                        </FormField>
                    </Form>
                </Container>
            </Grid>
            <Grid item xs={7}>
                <Table
                    actionGroup={tableActionsTrans}
                    tableTitle='Transcrições'
                    multiSelect={false}
                    columnDefinitions={columnDefinitions}
                    items={data}
                    getRowId={React.useCallback(data => data.id, [])}
                />
            </Grid>
        </Grid >
    );
}

export default Taquigrafia;