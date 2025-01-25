//show bpmn versions


import NavigationBar from "./NavigationBar.jsx";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Dialog, DialogActions,
    DialogContent, DialogContentText, DialogTitle,
    IconButton,
    Stack,
    Typography
} from "@mui/material";
import BpmnViewerComponent from "./BpmnViewer.jsx";
import React, {useEffect, useState} from "react";
import Grid from '@mui/material/Grid2';
import {useParams} from "react-router-dom";
import {refreshAccessToken} from "./auth.jsx";
import axios from "axios";
import VisibilityIcon from '@mui/icons-material/Visibility';
import RestoreIcon from '@mui/icons-material/Restore';
import NotificationSnackBar from "./NotificationSnackbar.jsx";
import config from "../config.js";

function BpmnVersionsModule() {
    const [diagramXml, setDiagramXml] = useState(""); // Current BPMN XML
    const [bpmnVersions, setBpmnVersions] = useState([]); // List of BPMN versions
    const { encryptedID } = useParams();
    const [versionID, setVersionID] = useState("");

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    const url = config.apiBaseUrl + "/bpmn/get-versions/" + encryptedID;

    const fetchDiagramVersions = async () => {

        const token = await refreshAccessToken()

        const response = await axios.get(
            url,
            {
                headers: {
                    "Authorization": `Bearer ${token}`, // Bearer token in headers
                    "Content-Type": "application/json",
                }
            }
        );


            setBpmnVersions(response.data.versions);
            if(response.data.versions.length > 0){
                setDiagramXml(response.data.versions[0].bpmn_xml);
            }

        console.log(response.data.versions);

    };


       const handleRestoreDiagram = async () => {

        try {
            const token = await refreshAccessToken()
            console.log('data:', versionID);
            console.log('token:', token);
            //
            // diagram_id = request.data.get('diagram_id')
            // new_bpmn_xml = request.data.get('bpmn_xml')
            // version_name = request.data.get('version_name')

            const url = config.apiBaseUrl + "/bpmn/restore-diagram-version/";
            const response = await axios.post(
                url,
                {
                    version_id: versionID,
                    encrypted_id: encryptedID
                },
                {
                    headers: {
                        "Authorization": `Bearer ${token}`, // Bearer token in headers
                        "Content-Type": "application/json",
                    }
                }
            );

            if (response.status === 200) {
                console.log("Response:", response.data);
                //go to path /homepage/bpmn/${encryptedID}
                window.location.href = `/homepage/bpmn/${encryptedID}`;
            }else
            {
                console.error("Failed to save BPMN XML to the server.");
            }

        } catch (error) {
            console.log("Error saving BPMN XML:", error);

        }
    }



    useEffect(() => {
        fetchDiagramVersions();
    }, []);

    //datetime to string
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
     }



    return (
        <React.Fragment>
        <div>
            <div style={{flex: "0 0 10%", height: "10%"}}>
                <NavigationBar username=""/>
            </div>

         <div style={{ height: "90%",marginTop:'80px',padding:'10px'}}>
             <Grid container spacing={2}>
                 <Grid size={3}>

                     <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                marginLeft: "10px",

                         }}>
                         {bpmnVersions.map((bpmnVersion, index) => (
                             <div key={index}
                             style={{
                                    marginBottom: "10px",
                                    borderRadius: "10px",
                                    width: "100%"
                             }}
                             >
                                 <Card key={index}
                                       onClick={() => {
                                           setDiagramXml(bpmnVersion.bpmn_xml)
                                       }

                                       }
                                 >
                                     <CardContent>
                                         <Typography variant="h5" component="h2">
                                             Version: {bpmnVersion.version_name}
                                         </Typography>
                                         <Typography color="textSecondary">
                                             Created on: {formatDate(new Date(bpmnVersion.created_at))}
                                         </Typography>
                                     </CardContent>
                                     <CardActions>
                                         <Stack direction="row" spacing={1} alignItems='flex-end'>
                                             {/*<IconButton aria-label="delete">*/}
                                             {/*    <DeleteIcon />*/}
                                             {/*</IconButton>*/}
                                             <IconButton
                                                 aria-label="restore"
                                                 onClick={() => {
                                                        setVersionID(bpmnVersion.id);

                                                     console.log("version id:", bpmnVersion.id);
                                                        handleClickOpen();
                                                 }}
                                             >
                                                 <RestoreIcon />
                                             </IconButton>

                                            <IconButton
                                                aria-label="visibility"
                                                onClick={() => setDiagramXml(bpmnVersion.bpmn_xml)}
                                            >
                                                 <VisibilityIcon />
                                             </IconButton>

                                         </Stack>
                                     </CardActions>
                                 </Card>
                             </div>
                         ))}
                     </div>
                 </Grid>
                 <Grid size="grow">
                     {<BpmnViewerComponent diagramXml={diagramXml}/>}
                 </Grid>
             </Grid>
         </div>

        </div>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Restore Diagram"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Do You want to restore this version?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>No</Button>
                    <Button onClick={
                        () => {
                            console.log("diagram  id:", versionID);
                            handleClose();
                            handleRestoreDiagram();
                        }
                    } autoFocus>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>

        </React.Fragment>
    );
}

export default BpmnVersionsModule;