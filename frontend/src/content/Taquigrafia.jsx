import React, { useCallback, useState } from 'react';
import api from '../services/api';
import Grid from 'aws-northstar/layouts/Grid';
import Container from 'aws-northstar/layouts/Container';
import Form from 'aws-northstar/components/Form';
import FormField from 'aws-northstar/components/FormField';
import Input from 'aws-northstar/components/Input';
import Textarea from 'aws-northstar/components/Textarea';
import Button from 'aws-northstar/components/Button';
import Inline from 'aws-northstar/layouts/Inline';
import StatusIndicator from 'aws-northstar/components/StatusIndicator';
import Table from 'aws-northstar/components/Table';
import DatePicker from 'aws-northstar/components/DatePicker';
import orderBy from 'lodash.orderby';

function Taquigrafia() {
    // START AUDIO //

    const columnDefinitionsAudio = [
        {
            id: 'audio_id',
            width: 200,
            Header: 'Id',
            accessor: 'audio_id'
        },
        {
            id: 'audio_path',
            width: 200,
            Header: 'File',
            accessor: 'audio_path'
        },
        {
            id: 'bucket',
            width: 200,
            Header: 'Bucket',
            accessor: 'bucket'
        },
        {
            id: 'trans_status',
            width: 200,
            Header: 'Status',
            accessor: 'trans_status',
            Cell: ({ row }) => {
                if (row && row.original) {
                    const status = row.original.trans_status;
                    switch (status) {
                        case '1':
                            return <StatusIndicator statusType='positive'>transcrito</StatusIndicator>;
                        case '0':
                            return <StatusIndicator statusType='negative'>intranscrito</StatusIndicator>;
                        default:
                            return null;
                    }
                }
                return null;
            }
        }
    ];

    const [dataAudio, setDataAudio] = useState([]);
    const [rowCount, setRowCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const fetchIdRef = React.useRef(0);

    const handleFetchData = useCallback(options => {
        setLoading(true);
        const fetchId = ++fetchIdRef.current;
        setTimeout(() => {
            if (fetchId === fetchIdRef.current) {
                api.get('audios').then(response => {
                    const filterData = response.data.filter(d => {
                        if (options.filterText) {
                            return d.audio_id.indexOf(options.filterText) > 0;
                        }

                        return true;
                    });
                    let tempData = filterData.slice(
                        options.pageIndex * options.pageSize,
                        (options.pageIndex + 1) * options.pageSize
                    );
                    if (options.sortBy && options.sortBy.length > 0) {
                        tempData = orderBy(tempData, options.sortBy[0].id, options.sortBy[0].desc ? 'desc' : 'asc');
                    }
                    setDataAudio(tempData);
                    setRowCount(filterData.length);
                    setLoading(false);
                });
            }
        }, 1000);
    }, []);

    const [audioSelect, setAudioSelect] = useState()

    const handleAudioSelect = (event) => {
        setAudioSelect(event[0])
    }

    const handleTranscription = () => {
        const audio = {
            "audio_id": audioSelect.audio_id,
            "audio_path": audioSelect.audio_path,
            "bucket": audioSelect.bucket
        }

        api.post("/transcribe", audio).then(response => {
            console.log(response)
        });
    }

    const handleValidateStatus = () => {
        api.get("/transcriptionstatus", { params: { id: audioSelect.audio_id } }).then(response => {
            console.log(response)
        });
    }

    const tableActionsAudio = (
        <Inline>
            <Button variant="primary" onClick={handleTranscription}>
                Transcrever
            </Button>
            <Button variant='link' onClick={handleValidateStatus}>
                Verificar
            </Button>
            <Button variant='link'>
                Editar Texto
            </Button>
            <Button variant='link'>
                Excluir
            </Button>
        </Inline>
    );

    const [selectedFile, setSelectedFile] = useState();
    const [isSelected, setIsSelected] = useState(false);

    const changeHandler = (event) => {
        setSelectedFile(event.target.files[0]);
        setIsSelected(true);
    };

    const handleSubmission = () => {
        if (isSelected === true) {
            var reader = new FileReader();
            reader.readAsDataURL(selectedFile);

            reader.onload = function () {
                const audio = {
                    'base64audio': reader.result
                }

                api.post("/audio", audio).then(
                    response => {
                        console.log(response.data)
                    }
                );
            };
            reader.onerror = function (error) {
                console.log('Error: ', error);
            };
        }
    };

    // END AUDIO //

    // START TRANSCRIPTION //

    const columnDefinitionsTrans = [
        {
            id: 'id',
            width: 200,
            Header: 'Id',
            accessor: 'id'
        }
    ];

    const dataTrans = [
        {
            id: 'id0000001'
        },
        {
            id: 'id0000002'
        }
    ];

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

    // END TRANSCRIPTION //

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Inline>
                    <input type="file" accept="audio/*" onChange={changeHandler} />
                    <Button onClick={handleSubmission}>
                        upload
                    </Button>
                </Inline>
            </Grid>
            <Grid item xs={12}>
                <Table
                    actionGroup={tableActionsAudio}
                    tableTitle='Áudios disponíveis'
                    multiSelect={false}
                    columnDefinitions={columnDefinitionsAudio}
                    items={dataAudio}
                    onFetchData={handleFetchData}
                    rowCount={rowCount}
                    onSelectionChange={handleAudioSelect}
                    loading={loading}
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
                    columnDefinitions={columnDefinitionsTrans}
                    items={dataTrans}
                    getRowId={React.useCallback(data => data.id, [])}
                />
            </Grid>
        </Grid >
    );
}

export default Taquigrafia;