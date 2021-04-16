import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Grid from 'aws-northstar/layouts/Grid';
import Container from 'aws-northstar/layouts/Container';
import Button from 'aws-northstar/components/Button';
import Inline from 'aws-northstar/layouts/Inline';
import StatusIndicator from 'aws-northstar/components/StatusIndicator';
import Table from 'aws-northstar/components/Table';
import Flashbar from 'aws-northstar/components/Flashbar';

import '../styles/global.css';

function Taquigrafia() {
    // START AUDIO //

    const [showStatus, setShowStatus] = useState(false);
    const [statusHeader, setStatusHeader] = useState();
    const [statusContent, setStatusContent] = useState();
    const [statusType, setStatusType] = useState();

    const flashBarContent = {
        header: statusHeader,
        content: statusContent,
        dismissible: false,
        type: statusType,
    };

    const [playing, setPlaying] = useState(false);
    const [audio, setAudio] = useState(new Audio());

    useEffect(() => {
        playing ? audio.play() : audio.pause();
    },
        [playing, audio]
    );

    useEffect(() => {
        audio.addEventListener('ended', () => setPlaying(false));
        return () => {
            audio.removeEventListener('ended', () => setPlaying(false));
        };
    }, [audio]);

    const handlePlayAudio = (audio_id) => {
        api.get('audiourl', { params: { id: audio_id } }).then(
            response => {
                setAudio(new Audio(response.data.url));
                setPlaying(!playing);
            }
        );
    }

    const handlePauseAudio = () => {
        setPlaying(false);
    }

    const columnDefinitionsAudio = [
        {
            id: 'audio_id',
            width: 200,
            Header: 'Id',
            accessor: 'audio_id'
        },
        {
            id: 'name',
            width: 200,
            Header: 'Name',
            accessor: 'name'
        },
        {
            id: 'audio_path',
            width: 200,
            Header: 'Audio',
            accessor: 'audio_path',
            Cell: ({ row }) => {
                if (row && row.original) {
                    const audio_id = row.original.audio_id;
                    switch (playing) {
                        case true:
                            return <Button variant="icon" icon="Stop" label="play" onClick={() => { handlePauseAudio() }} />
                        case false:
                            return <Button variant="icon" icon="PlayCircleFilled" label="play" onClick={() => { handlePlayAudio(audio_id) }} />
                        default:
                            return null;
                    }
                }
                return null;
            }
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
        },
    ];

    const [dataAudio, setDataAudio] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('audios').then(
            response => {
                setDataAudio(response.data)
            },
            error => {
                setStatusHeader('Falha');
                setStatusContent('Não foi possível carregar os áudios.')
                setStatusType('error');
                setShowStatus(true);
            }
        )
    }, [])

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

        setLoading(true);
        setStatusHeader('Executando');
        setStatusContent('Transcrição está sendo executada.')
        setStatusType('info');
        setShowStatus(true);

        api.post("/transcribe", audio).then(
            response => {
                setStatusHeader('Sucesso');
                setStatusContent('Transcrição realizada com sucesso.')
                setStatusType('success');
                setShowStatus(true);
                setLoading(false)
            },
            error => {
                setStatusHeader('Falha');
                setStatusContent('Não foi possível transcrever o áudio.')
                setStatusType('error');
                setShowStatus(true);
                setLoading(false);
            }
        );
    }

    const handleUpdateAudioData = () => {
        setLoading(true);

        api.get('audios').then(
            response => {
                setDataAudio(response.data)
                setLoading(false);
            },
            error => {
                setStatusHeader('Falha');
                setStatusContent('Não foi possível carregar os áudios.')
                setStatusType('error');
                setShowStatus(true);
                setLoading(false);
            }
        )
    }

    const [textTranscribe, setTextTranscribe] = useState([])

    const handleEditText = () => {
        setTextTranscribe([]) // clean up

        api.get("/transcriptioncontent", { params: { id: audioSelect.audio_id } }).then
            (response => {
                setTextTranscribe(
                    [
                        {
                            'id': '1',
                            'text': response.data.content
                        },
                    ]
                )
            });
    }

    const tableActionsAudio = (
        <Inline>
            <Button variant="primary" onClick={handleTranscription}>
                Transcrever
            </Button>
            <Button variant='link' onClick={handleUpdateAudioData}>
                Atualizar
            </Button>
            <Button variant='link' onClick={handleEditText}>
                Editar Texto
            </Button>
            {/*<Button variant='link'>
                Excluir
    </Button>*/}
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
            const filename = selectedFile['name'];
            reader.readAsDataURL(selectedFile);

            reader.onload = function () {
                const audio = {
                    'base64audio': reader.result,
                    'filename': filename
                }

                setStatusHeader('Executando');
                setStatusContent('Upload está sendo realizado')
                setStatusType('info');
                setShowStatus(true);

                api.post("/audio", audio).then(
                    response => {
                        setStatusHeader('Sucesso');
                        setStatusContent('Upload realizado com sucesso.')
                        setStatusType('success');
                        setShowStatus(true);
                    }, error => {
                        setStatusHeader('Falha');
                        setStatusContent('Upload não foi realizado com sucesso.')
                        setStatusType('error');
                        setShowStatus(true);
                    }
                );
            };
            reader.onerror = function (error) {
                setStatusHeader('Falha');
                setStatusContent('Upload não foi realizado com sucesso.')
                setStatusType('error');
                setShowStatus(true);
            };
        }
    };

    // END AUDIO //

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
            {
                (function () {
                    if (showStatus) {
                        return <Grid item xs={12}> <Flashbar items={[flashBarContent]} /> </Grid>;
                    } else {
                        return;
                    }
                })()
            }
            <Grid item xs={12}>
                <Table
                    actionGroup={tableActionsAudio}
                    tableTitle='Áudios disponíveis'
                    multiSelect={false}
                    columnDefinitions={columnDefinitionsAudio}
                    items={dataAudio}
                    onSelectionChange={handleAudioSelect}
                    loading={loading}
                />
            </Grid>
            <Grid item xs={12}>
                <Container
                    title="Segmentos"
                    subtitle="Recortes do texto transcrito"
                >
                    {textTranscribe.map(segment => {
                        return (
                            <textarea key={segment.id} className="textareaclass">
                                {segment.text}
                            </textarea>
                        )
                    })}
                </Container>
            </Grid>
        </Grid >
    );
}

export default Taquigrafia;