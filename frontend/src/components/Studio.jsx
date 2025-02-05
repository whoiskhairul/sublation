import React, { useState, useEffect } from "react";

import ChatSection from "./ChatSection";
import BpmnModelerComponent from "./BpmnModeler";
import NavigationBar from './NavigationBar'; // Import NavigationBar component
import BpmnViewerComponent from "./BpmnViewerComponent.jsx";
import { useParams } from "react-router-dom";
import axios from "axios";
import { refreshAccessToken } from "./auth.jsx";
import NotificationSnackBar from "./NotificationSnackbar";
import NotAllowed from "./NotAllowed";
import config from '../config';


function Studio() {
    const [diagramXml, setDiagramXml] = useState("");
    const [diagramName, setDiagramName] = useState("");
    const [messages, setMessages] = useState("");
    const [permissions, setPermissions] = useState("");

    const username = 'John Doe'; // Replace with dynamic username if available

    const { encryptedID } = useParams(); // Get encrypted ID from the URL

    const url = config.apiBaseUrl + "/bpmn/get-xml/" + encryptedID
    const fetchDiagramData = async () => {
        const credentials = {
            withCredentials: true
        };
        const token = await refreshAccessToken()

        axios.get(url, {
            ...credentials,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (response.data.XMLdiagram) {
                    setDiagramXml(response.data.XMLdiagram);
                    setDiagramName(response.data.diagramName)
                }
                if (response.data.messages) {
                    setMessages(response.data.messages);
                }
                if (response.data.permissions) {
                    setPermissions(response.data.permissions);
                }

                if (response.data.reply) {
                    setNotifMessage(response.data.reply);
                    setNotifSeverity('success');
                    setNotifOpen(true);
                }

            })
            .catch((error) => {
                const reply = error.response.data.reply;
                console.log(error);
                setNotifMessage(reply);
                setNotifSeverity('error');
                setNotifOpen(true);
            }
            );

    };

    useEffect(() => {
        fetchDiagramData();
    }, [url]);


    // This will be called whenever the chat receives a new BPMN XML from the server
    const handleNewDiagram = (newXml) => {
        setDiagramXml(newXml);
    };

    // Snackbar settings 
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifMessage, setNotifMessage] = useState('');
    const [notifSeverity, setNotifSeverity] = useState('success');

    const handleClose = (_event, reason) => {
        if (reason === 'clickaway') {
            return;  // ignore if user clicks away
        }
        setNotifOpen(false);
    };

    return (
        <div>
            {/* NAVBAR */}
            <div style={{ flex: "0 0 10%", height: "10%" }}>
                <NavigationBar username={username} />
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="studio-content" style={{ display: "flex", flexGrow: 1, position: "relative" }}>
                {/* LEFT: BPMN EDITOR */}
                <div style={{ width: "100%" }}>
                    {permissions && permissions === 'editor' ?
                        <BpmnModelerComponent diagramXml={diagramXml} diagramName={diagramName} permissions={permissions} />
                        : permissions && permissions === 'viewer' ?
                            <BpmnViewerComponent diagramXml={diagramXml} diagramName={diagramName} permissions={permissions} />
                            : permissions && permissions === 'restricted' ?
                                <NotAllowed />
                                : ''
                    }
                    {/* FLOATING CHAT */}
                    {permissions && permissions === 'editor' ?
                        <ChatSection onNewDiagram={handleNewDiagram} conversation={messages} />
                        : permissions && permissions === 'viewer' ?
                            <ChatSection onNewDiagram={handleNewDiagram} conversation={messages} Chatdisabled={true} />
                            : permissions && permissions === 'restricted' ?
                                ''
                                : ''
                    }
                </div>
                <NotificationSnackBar
                    open={notifOpen}
                    onClose={handleClose}
                    severity={notifSeverity}
                    message={notifMessage}
                />
            </div>
        </div>
    );
}

export default Studio;
