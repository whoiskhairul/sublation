import React, { useState, useEffect } from "react";
import ChatSection from "./ChatSection";
import BpmnModelerComponent from "./BpmnModeler2";
import NavigationBar from '../NavigationBar'; // Import NavigationBar component
import { useParams } from "react-router-dom";
import axios from "axios";
import config from "../../config";

function Studio() {
    const [diagramXml, setDiagramXml] = useState("");
    const [messages, setMessages] = useState("");
    const username = 'John Doe'; // Replace with dynamic username if available

    const { encryptedID } = useParams(); // Get encrypted ID from the URL

    const url = config.apiBaseUrl + "/bpmn/get-xml/"+ encryptedID
    useEffect(() => {
        const credentials = {
            withCredentials: true
        };

        axios.get(url, {
            ...credentials,
            headers: {
                Authorization: `Bearer ${localStorage.access}`,
            },
        })
        .then((response) => {
            if (response.data.XMLdiagram) {
                setDiagramXml(response.data.XMLdiagram);
            }
            if (response.data.messages) {
                setMessages(response.data.messages);
            }
        })
        .catch((error) => console.error(error));
    }, [url]);


    // This will be called whenever the chat receives a new BPMN XML from the server
    const handleNewDiagram = (newXml) => {
        setDiagramXml(newXml);
    };

    return (
        <div>
            {/* NAVBAR */}
            <div style={{ flex: "0 0 10%", height: "10%" }}>
              <NavigationBar username={username} />
            </div>
            
            {/* MAIN CONTENT AREA */}
            <div className="studio-content" style={{ display: "flex", flexGrow: 1, position: "relative"}}>
                {/* LEFT: BPMN EDITOR */}
                <div style={{ width: "100%" }}>
                    <BpmnModelerComponent diagramXml={diagramXml} />
                    {/* FLOATING CHAT */}
                <ChatSection
                    onNewDiagram={handleNewDiagram}
                    conversation={messages}
                />
                </div>

                
</div>
        </div>
    );
};

export default Studio;
