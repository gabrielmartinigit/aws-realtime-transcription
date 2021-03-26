import React from 'react';
import Container from 'aws-northstar/layouts/Container';
import Grid from 'aws-northstar/layouts/Grid';
import Table from 'aws-northstar/components/Table';
import Button from 'aws-northstar/components/Button';
import Inline from 'aws-northstar/layouts/Inline';
import StatusIndicator from 'aws-northstar/components/StatusIndicator';

function Transcription() {
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
                    actionGroup={tableActions}
                    tableTitle='Transcrições'
                    disableFilters={true}
                    multiSelect={true}
                    columnDefinitions={columnDefinitions}
                    items={data}
                    getRowId={React.useCallback(data => data.id, [])}
                />
            </Grid>
        </Grid>
    );
}

export default Transcription;