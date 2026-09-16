"""
Standard Curated BPMN 2.0 Templates for Sublation BPMN Platform.
Contains 5 highly requested, industry-standard business workflows with complete, valid BPMN 2.0 XML
and full BPMNDiagram / BPMNPlane DI layout information.
"""

TEMPLATES = [
    {
        "name": "Order-to-Cash (Procurement & Fulfillment)",
        "description": "Comprehensive end-to-end sales order processing from customer purchase order receipt through inventory reservation, credit approval, automated pick-pack-ship, and invoice settlement.",
        "category": "Operations",
        "xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_O2C" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_OrderToCash" name="Order-to-Cash Process" isExecutable="true">
    <bpmn:startEvent id="Start_OrderReceived" name="Customer Order Received">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_VerifyStock" name="Verify Stock Availability">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:exclusiveGateway id="Gateway_StockCheck" name="In Stock?">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_StockYes</bpmn:outgoing>
      <bpmn:outgoing>Flow_StockNo</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:task id="Task_ProcureBackorder" name="Trigger Supplier Backorder">
      <bpmn:incoming>Flow_StockNo</bpmn:incoming>
      <bpmn:outgoing>Flow_BackorderDone</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_AuthorizePayment" name="Authorize Payment &amp; Credit">
      <bpmn:incoming>Flow_StockYes</bpmn:incoming>
      <bpmn:incoming>Flow_BackorderDone</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_PickAndPack" name="Warehouse Pick &amp; Pack">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_DispatchShipment" name="Dispatch Goods with Carrier">
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_IssueInvoice" name="Generate &amp; Email Invoice">
      <bpmn:incoming>Flow_5</bpmn:incoming>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="End_OrderFulfilled" name="Order Completed &amp; Billed">
      <bpmn:incoming>Flow_6</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="Start_OrderReceived" targetRef="Task_VerifyStock" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_VerifyStock" targetRef="Gateway_StockCheck" />
    <bpmn:sequenceFlow id="Flow_StockYes" name="Yes" sourceRef="Gateway_StockCheck" targetRef="Task_AuthorizePayment" />
    <bpmn:sequenceFlow id="Flow_StockNo" name="No" sourceRef="Gateway_StockCheck" targetRef="Task_ProcureBackorder" />
    <bpmn:sequenceFlow id="Flow_BackorderDone" sourceRef="Task_ProcureBackorder" targetRef="Task_AuthorizePayment" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Task_AuthorizePayment" targetRef="Task_PickAndPack" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Task_PickAndPack" targetRef="Task_DispatchShipment" />
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_DispatchShipment" targetRef="Task_IssueInvoice" />
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Task_IssueInvoice" targetRef="End_OrderFulfilled" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_O2C">
    <bpmndi:BPMNPlane id="BPMNPlane_O2C" bpmnElement="Process_OrderToCash">
      <bpmndi:BPMNShape id="Shape_Start" bpmnElement="Start_OrderReceived">
        <dc:Bounds x="160" y="162" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_VerifyStock" bpmnElement="Task_VerifyStock">
        <dc:Bounds x="250" y="140" width="130" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_GatewayStock" bpmnElement="Gateway_StockCheck" isMarkerVisible="true">
        <dc:Bounds x="430" y="155" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Backorder" bpmnElement="Task_ProcureBackorder">
        <dc:Bounds x="400" y="270" width="130" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_AuthPay" bpmnElement="Task_AuthorizePayment">
        <dc:Bounds x="540" y="140" width="130" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_PickPack" bpmnElement="Task_PickAndPack">
        <dc:Bounds x="720" y="140" width="130" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Dispatch" bpmnElement="Task_DispatchShipment">
        <dc:Bounds x="900" y="140" width="130" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Invoice" bpmnElement="Task_IssueInvoice">
        <dc:Bounds x="1080" y="140" width="130" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End" bpmnElement="End_OrderFulfilled">
        <dc:Bounds x="1260" y="162" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Edge_Flow1" bpmnElement="Flow_1">
        <di:waypoint x="196" y="180" />
        <di:waypoint x="250" y="180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow2" bpmnElement="Flow_2">
        <di:waypoint x="380" y="180" />
        <di:waypoint x="430" y="180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_StockYes" bpmnElement="Flow_StockYes">
        <di:waypoint x="480" y="180" />
        <di:waypoint x="540" y="180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_StockNo" bpmnElement="Flow_StockNo">
        <di:waypoint x="455" y="205" />
        <di:waypoint x="455" y="270" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_BackorderDone" bpmnElement="Flow_BackorderDone">
        <di:waypoint x="530" y="310" />
        <di:waypoint x="605" y="310" />
        <di:waypoint x="605" y="220" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow3" bpmnElement="Flow_3">
        <di:waypoint x="670" y="180" />
        <di:waypoint x="720" y="180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow4" bpmnElement="Flow_4">
        <di:waypoint x="850" y="180" />
        <di:waypoint x="900" y="180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow5" bpmnElement="Flow_5">
        <di:waypoint x="1030" y="180" />
        <di:waypoint x="1080" y="180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow6" bpmnElement="Flow_6">
        <di:waypoint x="1210" y="180" />
        <di:waypoint x="1260" y="180" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""
    },
    {
        "name": "Employee Onboarding Workflow",
        "description": "Standard corporate onboarding process handling IT equipment provisioning, email and systems account setup, HR compliance orientation, and manager 30-day check-in.",
        "category": "Human Resources",
        "xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_Onboarding" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_EmployeeOnboarding" name="Employee Onboarding" isExecutable="true">
    <bpmn:startEvent id="Start_CandidateAccepted" name="Offer Letter Accepted">
      <bpmn:outgoing>Flow_O1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:parallelGateway id="Gateway_ForkOnboarding" name="Initialize Tasks">
      <bpmn:incoming>Flow_O1</bpmn:incoming>
      <bpmn:outgoing>Flow_ToIT</bpmn:outgoing>
      <bpmn:outgoing>Flow_ToHR</bpmn:outgoing>
    </bpmn:parallelGateway>
    <bpmn:task id="Task_ProvisionIT" name="Provision Hardware &amp; Email Accounts">
      <bpmn:incoming>Flow_ToIT</bpmn:incoming>
      <bpmn:outgoing>Flow_ITDone</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_ConductHR" name="Collect Tax Forms &amp; Sign Contracts">
      <bpmn:incoming>Flow_ToHR</bpmn:incoming>
      <bpmn:outgoing>Flow_HRDone</bpmn:outgoing>
    </bpmn:task>
    <bpmn:parallelGateway id="Gateway_JoinOnboarding">
      <bpmn:incoming>Flow_ITDone</bpmn:incoming>
      <bpmn:incoming>Flow_HRDone</bpmn:incoming>
      <bpmn:outgoing>Flow_ToDay1</bpmn:outgoing>
    </bpmn:parallelGateway>
    <bpmn:task id="Task_DayOneOrientation" name="Conduct Day One Welcome &amp; Tour">
      <bpmn:incoming>Flow_ToDay1</bpmn:incoming>
      <bpmn:outgoing>Flow_ToReview</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_ManagerReview" name="Manager 30-Day Check-in &amp; Goals">
      <bpmn:incoming>Flow_ToReview</bpmn:incoming>
      <bpmn:outgoing>Flow_OEnd</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="End_OnboardingComplete" name="Onboarding Completed">
      <bpmn:incoming>Flow_OEnd</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_O1" sourceRef="Start_CandidateAccepted" targetRef="Gateway_ForkOnboarding" />
    <bpmn:sequenceFlow id="Flow_ToIT" sourceRef="Gateway_ForkOnboarding" targetRef="Task_ProvisionIT" />
    <bpmn:sequenceFlow id="Flow_ToHR" sourceRef="Gateway_ForkOnboarding" targetRef="Task_ConductHR" />
    <bpmn:sequenceFlow id="Flow_ITDone" sourceRef="Task_ProvisionIT" targetRef="Gateway_JoinOnboarding" />
    <bpmn:sequenceFlow id="Flow_HRDone" sourceRef="Task_ConductHR" targetRef="Gateway_JoinOnboarding" />
    <bpmn:sequenceFlow id="Flow_ToDay1" sourceRef="Gateway_JoinOnboarding" targetRef="Task_DayOneOrientation" />
    <bpmn:sequenceFlow id="Flow_ToReview" sourceRef="Task_DayOneOrientation" targetRef="Task_ManagerReview" />
    <bpmn:sequenceFlow id="Flow_OEnd" sourceRef="Task_ManagerReview" targetRef="End_OnboardingComplete" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_Onboarding">
    <bpmndi:BPMNPlane id="BPMNPlane_Onboarding" bpmnElement="Process_EmployeeOnboarding">
      <bpmndi:BPMNShape id="Shape_StartO" bpmnElement="Start_CandidateAccepted">
        <dc:Bounds x="160" y="162" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_ForkO" bpmnElement="Gateway_ForkOnboarding">
        <dc:Bounds x="250" y="155" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_IT" bpmnElement="Task_ProvisionIT">
        <dc:Bounds x="350" y="80" width="140" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_HR" bpmnElement="Task_ConductHR">
        <dc:Bounds x="350" y="210" width="140" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_JoinO" bpmnElement="Gateway_JoinOnboarding">
        <dc:Bounds x="540" y="155" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Day1" bpmnElement="Task_DayOneOrientation">
        <dc:Bounds x="640" y="140" width="140" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_MgrReview" bpmnElement="Task_ManagerReview">
        <dc:Bounds x="830" y="140" width="140" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_EndO" bpmnElement="End_OnboardingComplete">
        <dc:Bounds x="1020" y="162" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Edge_O1" bpmnElement="Flow_O1">
        <di:waypoint x="196" y="180" />
        <di:waypoint x="250" y="180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_ToIT" bpmnElement="Flow_ToIT">
        <di:waypoint x="275" y="155" />
        <di:waypoint x="275" y="120" />
        <di:waypoint x="350" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_ToHR" bpmnElement="Flow_ToHR">
        <di:waypoint x="275" y="205" />
        <di:waypoint x="275" y="250" />
        <di:waypoint x="350" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_ITDone" bpmnElement="Flow_ITDone">
        <di:waypoint x="490" y="120" />
        <di:waypoint x="565" y="120" />
        <di:waypoint x="565" y="155" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_HRDone" bpmnElement="Flow_HRDone">
        <di:waypoint x="490" y="250" />
        <di:waypoint x="565" y="250" />
        <di:waypoint x="565" y="205" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_ToDay1" bpmnElement="Flow_ToDay1">
        <di:waypoint x="590" y="180" />
        <di:waypoint x="640" y="180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_ToReview" bpmnElement="Flow_ToReview">
        <di:waypoint x="780" y="180" />
        <di:waypoint x="830" y="180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_OEnd" bpmnElement="Flow_OEnd">
        <di:waypoint x="970" y="180" />
        <di:waypoint x="1020" y="180" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""
    },
    {
        "name": "IT Incident Management & Resolution",
        "description": "ITIL-aligned incident response pipeline from initial ticket creation and triage, through Tier 1 resolution, automated escalation for major incidents, root-cause patch, and post-mortem review.",
        "category": "IT Service Management",
        "xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_Incident" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_IncidentManagement" name="IT Incident Management" isExecutable="true">
    <bpmn:startEvent id="Start_IncidentReported" name="Incident Reported">
      <bpmn:outgoing>Flow_I1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_TriageSeverity" name="Triage &amp; Categorize Severity">
      <bpmn:incoming>Flow_I1</bpmn:incoming>
      <bpmn:outgoing>Flow_I2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:exclusiveGateway id="Gateway_IsCritical" name="Critical / Major?">
      <bpmn:incoming>Flow_I2</bpmn:incoming>
      <bpmn:outgoing>Flow_MajorYes</bpmn:outgoing>
      <bpmn:outgoing>Flow_MajorNo</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:task id="Task_Tier1Resolve" name="Apply Tier 1 Standard Fix">
      <bpmn:incoming>Flow_MajorNo</bpmn:incoming>
      <bpmn:outgoing>Flow_ToVerify</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_EscalateTier3" name="Mobilize Incident Response War Room">
      <bpmn:incoming>Flow_MajorYes</bpmn:incoming>
      <bpmn:outgoing>Flow_ToDeployHotfix</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_DeployHotfix" name="Deploy Production Hotfix / Failover">
      <bpmn:incoming>Flow_ToDeployHotfix</bpmn:incoming>
      <bpmn:outgoing>Flow_HotfixDone</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_VerifyResolution" name="Verify Service Restoration">
      <bpmn:incoming>Flow_ToVerify</bpmn:incoming>
      <bpmn:incoming>Flow_HotfixDone</bpmn:incoming>
      <bpmn:outgoing>Flow_ToClose</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_ConductPostMortem" name="Document RCA &amp; Close Incident">
      <bpmn:incoming>Flow_ToClose</bpmn:incoming>
      <bpmn:outgoing>Flow_IEnd</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="End_IncidentClosed" name="Service Restored &amp; Closed">
      <bpmn:incoming>Flow_IEnd</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_I1" sourceRef="Start_IncidentReported" targetRef="Task_TriageSeverity" />
    <bpmn:sequenceFlow id="Flow_I2" sourceRef="Task_TriageSeverity" targetRef="Gateway_IsCritical" />
    <bpmn:sequenceFlow id="Flow_MajorNo" name="Standard" sourceRef="Gateway_IsCritical" targetRef="Task_Tier1Resolve" />
    <bpmn:sequenceFlow id="Flow_MajorYes" name="Major P1/P2" sourceRef="Gateway_IsCritical" targetRef="Task_EscalateTier3" />
    <bpmn:sequenceFlow id="Flow_ToDeployHotfix" sourceRef="Task_EscalateTier3" targetRef="Task_DeployHotfix" />
    <bpmn:sequenceFlow id="Flow_ToVerify" sourceRef="Task_Tier1Resolve" targetRef="Task_VerifyResolution" />
    <bpmn:sequenceFlow id="Flow_HotfixDone" sourceRef="Task_DeployHotfix" targetRef="Task_VerifyResolution" />
    <bpmn:sequenceFlow id="Flow_ToClose" sourceRef="Task_VerifyResolution" targetRef="Task_ConductPostMortem" />
    <bpmn:sequenceFlow id="Flow_IEnd" sourceRef="Task_ConductPostMortem" targetRef="End_IncidentClosed" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_Incident">
    <bpmndi:BPMNPlane id="BPMNPlane_Incident" bpmnElement="Process_IncidentManagement">
      <bpmndi:BPMNShape id="Shape_StartI" bpmnElement="Start_IncidentReported">
        <dc:Bounds x="160" y="162" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Triage" bpmnElement="Task_TriageSeverity">
        <dc:Bounds x="250" y="140" width="130" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_GateCritical" bpmnElement="Gateway_IsCritical" isMarkerVisible="true">
        <dc:Bounds x="430" y="155" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Tier1" bpmnElement="Task_Tier1Resolve">
        <dc:Bounds x="530" y="80" width="130" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Escalate" bpmnElement="Task_EscalateTier3">
        <dc:Bounds x="530" y="220" width="140" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Hotfix" bpmnElement="Task_DeployHotfix">
        <dc:Bounds x="710" y="220" width="130" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_VerifyRes" bpmnElement="Task_VerifyResolution">
        <dc:Bounds x="870" y="140" width="130" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_PostMortem" bpmnElement="Task_ConductPostMortem">
        <dc:Bounds x="1040" y="140" width="130" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_EndI" bpmnElement="End_IncidentClosed">
        <dc:Bounds x="1210" y="162" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Edge_I1" bpmnElement="Flow_I1">
        <di:waypoint x="196" y="180" />
        <di:waypoint x="250" y="180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_I2" bpmnElement="Flow_I2">
        <di:waypoint x="380" y="180" />
        <di:waypoint x="430" y="180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_MajorNo" bpmnElement="Flow_MajorNo">
        <di:waypoint x="455" y="155" />
        <di:waypoint x="455" y="120" />
        <di:waypoint x="530" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_MajorYes" bpmnElement="Flow_MajorYes">
        <di:waypoint x="455" y="205" />
        <di:waypoint x="455" y="260" />
        <di:waypoint x="530" y="260" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_ToDeployHotfix" bpmnElement="Flow_ToDeployHotfix">
        <di:waypoint x="670" y="260" />
        <di:waypoint x="710" y="260" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_ToVerify" bpmnElement="Flow_ToVerify">
        <di:waypoint x="660" y="120" />
        <di:waypoint x="935" y="120" />
        <di:waypoint x="935" y="140" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_HotfixDone" bpmnElement="Flow_HotfixDone">
        <di:waypoint x="840" y="260" />
        <di:waypoint x="935" y="260" />
        <di:waypoint x="935" y="220" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_ToClose" bpmnElement="Flow_ToClose">
        <di:waypoint x="1000" y="180" />
        <di:waypoint x="1040" y="180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_IEnd" bpmnElement="Flow_IEnd">
        <di:waypoint x="1170" y="180" />
        <di:waypoint x="1210" y="180" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""
    },
    {
        "name": "Customer Support Ticket Escalation",
        "description": "Standard omnichannel customer support lifecycle: inbound ticket classification, automated knowledge base lookup, agent assignment, customer feedback survey, and satisfaction closure.",
        "category": "Customer Experience",
        "xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_Support" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_CustomerSupport" name="Customer Support Lifecycle" isExecutable="true">
    <bpmn:startEvent id="Start_TicketCreated" name="Support Ticket Submitted">
      <bpmn:outgoing>Flow_S1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_AnalyzeIntent" name="Analyze Inquiry &amp; Suggest KB Articles">
      <bpmn:incoming>Flow_S1</bpmn:incoming>
      <bpmn:outgoing>Flow_S2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:exclusiveGateway id="Gateway_SelfServeResolved" name="Resolved via KB?">
      <bpmn:incoming>Flow_S2</bpmn:incoming>
      <bpmn:outgoing>Flow_KBSolved</bpmn:outgoing>
      <bpmn:outgoing>Flow_KBNegative</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:task id="Task_AssignAgent" name="Assign to Specialist Support Agent">
      <bpmn:incoming>Flow_KBNegative</bpmn:incoming>
      <bpmn:outgoing>Flow_S3</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_ProvideAssistance" name="Engage Customer &amp; Provide Solution">
      <bpmn:incoming>Flow_S3</bpmn:incoming>
      <bpmn:outgoing>Flow_S4</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_SendCSATSurvey" name="Send Customer Satisfaction (CSAT) Survey">
      <bpmn:incoming>Flow_KBSolved</bpmn:incoming>
      <bpmn:incoming>Flow_S4</bpmn:incoming>
      <bpmn:outgoing>Flow_S5</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="End_TicketResolved" name="Case Closed &amp; Archived">
      <bpmn:incoming>Flow_S5</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_S1" sourceRef="Start_TicketCreated" targetRef="Task_AnalyzeIntent" />
    <bpmn:sequenceFlow id="Flow_S2" sourceRef="Task_AnalyzeIntent" targetRef="Gateway_SelfServeResolved" />
    <bpmn:sequenceFlow id="Flow_KBSolved" name="Yes" sourceRef="Gateway_SelfServeResolved" targetRef="Task_SendCSATSurvey" />
    <bpmn:sequenceFlow id="Flow_KBNegative" name="No" sourceRef="Gateway_SelfServeResolved" targetRef="Task_AssignAgent" />
    <bpmn:sequenceFlow id="Flow_S3" sourceRef="Task_AssignAgent" targetRef="Task_ProvideAssistance" />
    <bpmn:sequenceFlow id="Flow_S4" sourceRef="Task_ProvideAssistance" targetRef="Task_SendCSATSurvey" />
    <bpmn:sequenceFlow id="Flow_S5" sourceRef="Task_SendCSATSurvey" targetRef="End_TicketResolved" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_Support">
    <bpmndi:BPMNPlane id="BPMNPlane_Support" bpmnElement="Process_CustomerSupport">
      <bpmndi:BPMNShape id="Shape_StartS" bpmnElement="Start_TicketCreated">
        <dc:Bounds x="160" y="162" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_AnalyzeKB" bpmnElement="Task_AnalyzeIntent">
        <dc:Bounds x="250" y="140" width="140" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_GateKB" bpmnElement="Gateway_SelfServeResolved" isMarkerVisible="true">
        <dc:Bounds x="440" y="155" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_AssignAgent" bpmnElement="Task_AssignAgent">
        <dc:Bounds x="540" y="140" width="130" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Assist" bpmnElement="Task_ProvideAssistance">
        <dc:Bounds x="710" y="140" width="130" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_CSAT" bpmnElement="Task_SendCSATSurvey">
        <dc:Bounds x="890" y="140" width="140" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_EndS" bpmnElement="End_TicketResolved">
        <dc:Bounds x="1080" y="162" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Edge_S1" bpmnElement="Flow_S1">
        <di:waypoint x="196" y="180" />
        <di:waypoint x="250" y="180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_S2" bpmnElement="Flow_S2">
        <di:waypoint x="390" y="180" />
        <di:waypoint x="440" y="180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_KBSolved" bpmnElement="Flow_KBSolved">
        <di:waypoint x="465" y="155" />
        <di:waypoint x="465" y="90" />
        <di:waypoint x="960" y="90" />
        <di:waypoint x="960" y="140" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_KBNegative" bpmnElement="Flow_KBNegative">
        <di:waypoint x="490" y="180" />
        <di:waypoint x="540" y="180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_S3" bpmnElement="Flow_S3">
        <di:waypoint x="670" y="180" />
        <di:waypoint x="710" y="180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_S4" bpmnElement="Flow_S4">
        <di:waypoint x="840" y="180" />
        <di:waypoint x="890" y="180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_S5" bpmnElement="Flow_S5">
        <di:waypoint x="1030" y="180" />
        <di:waypoint x="1080" y="180" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""
    },
    {
        "name": "Invoice Approval & Expense Reimbursement",
        "description": "Corporate finance governance workflow for business expense claims: receipt submission, automated policy compliance check, manager sign-off, finance disbursement, and ERP record logging.",
        "category": "Finance & Accounting",
        "xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_Expense" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_ExpenseApproval" name="Expense Reimbursement Process" isExecutable="true">
    <bpmn:startEvent id="Start_ClaimSubmitted" name="Expense Claim Submitted">
      <bpmn:outgoing>Flow_E1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_AuditReceipts" name="Automated Receipt &amp; Policy Check">
      <bpmn:incoming>Flow_E1</bpmn:incoming>
      <bpmn:outgoing>Flow_E2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:exclusiveGateway id="Gateway_PolicyCompliant" name="Within Policy Limits?">
      <bpmn:incoming>Flow_E2</bpmn:incoming>
      <bpmn:outgoing>Flow_PolicyPass</bpmn:outgoing>
      <bpmn:outgoing>Flow_PolicyFail</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:task id="Task_RejectClaim" name="Notify Employee &amp; Reject Claim">
      <bpmn:incoming>Flow_PolicyFail</bpmn:incoming>
      <bpmn:incoming>Flow_MgrReject</bpmn:incoming>
      <bpmn:outgoing>Flow_ToEndReject</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_ManagerApproval" name="Line Manager Review &amp; Approval">
      <bpmn:incoming>Flow_PolicyPass</bpmn:incoming>
      <bpmn:outgoing>Flow_E3</bpmn:outgoing>
    </bpmn:task>
    <bpmn:exclusiveGateway id="Gateway_ManagerDecision" name="Approved?">
      <bpmn:incoming>Flow_E3</bpmn:incoming>
      <bpmn:outgoing>Flow_MgrApproved</bpmn:outgoing>
      <bpmn:outgoing>Flow_MgrReject</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:task id="Task_ProcessPayment" name="Finance Direct Bank Deposit">
      <bpmn:incoming>Flow_MgrApproved</bpmn:incoming>
      <bpmn:outgoing>Flow_E4</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_UpdateLedger" name="Reconcile &amp; Post to General Ledger">
      <bpmn:incoming>Flow_E4</bpmn:incoming>
      <bpmn:outgoing>Flow_EEnd</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="End_Reimbursed" name="Reimbursement Disbursed">
      <bpmn:incoming>Flow_EEnd</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:endEvent id="End_Rejected" name="Claim Rejected">
      <bpmn:incoming>Flow_ToEndReject</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_E1" sourceRef="Start_ClaimSubmitted" targetRef="Task_AuditReceipts" />
    <bpmn:sequenceFlow id="Flow_E2" sourceRef="Task_AuditReceipts" targetRef="Gateway_PolicyCompliant" />
    <bpmn:sequenceFlow id="Flow_PolicyPass" name="Yes" sourceRef="Gateway_PolicyCompliant" targetRef="Task_ManagerApproval" />
    <bpmn:sequenceFlow id="Flow_PolicyFail" name="No" sourceRef="Gateway_PolicyCompliant" targetRef="Task_RejectClaim" />
    <bpmn:sequenceFlow id="Flow_E3" sourceRef="Task_ManagerApproval" targetRef="Gateway_ManagerDecision" />
    <bpmn:sequenceFlow id="Flow_MgrApproved" name="Approved" sourceRef="Gateway_ManagerDecision" targetRef="Task_ProcessPayment" />
    <bpmn:sequenceFlow id="Flow_MgrReject" name="Declined" sourceRef="Gateway_ManagerDecision" targetRef="Task_RejectClaim" />
    <bpmn:sequenceFlow id="Flow_ToEndReject" sourceRef="Task_RejectClaim" targetRef="End_Rejected" />
    <bpmn:sequenceFlow id="Flow_E4" sourceRef="Task_ProcessPayment" targetRef="Task_UpdateLedger" />
    <bpmn:sequenceFlow id="Flow_EEnd" sourceRef="Task_UpdateLedger" targetRef="End_Reimbursed" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_Expense">
    <bpmndi:BPMNPlane id="BPMNPlane_Expense" bpmnElement="Process_ExpenseApproval">
      <bpmndi:BPMNShape id="Shape_StartE" bpmnElement="Start_ClaimSubmitted">
        <dc:Bounds x="160" y="162" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Audit" bpmnElement="Task_AuditReceipts">
        <dc:Bounds x="250" y="140" width="140" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_GatePolicy" bpmnElement="Gateway_PolicyCompliant" isMarkerVisible="true">
        <dc:Bounds x="440" y="155" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Reject" bpmnElement="Task_RejectClaim">
        <dc:Bounds x="400" y="270" width="130" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_EndReject" bpmnElement="End_Rejected">
        <dc:Bounds x="580" y="292" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_MgrReview" bpmnElement="Task_ManagerApproval">
        <dc:Bounds x="540" y="140" width="130" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_GateMgr" bpmnElement="Gateway_ManagerDecision" isMarkerVisible="true">
        <dc:Bounds x="720" y="155" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Payment" bpmnElement="Task_ProcessPayment">
        <dc:Bounds x="820" y="140" width="130" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Ledger" bpmnElement="Task_UpdateLedger">
        <dc:Bounds x="1000" y="140" width="130" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_EndE" bpmnElement="End_Reimbursed">
        <dc:Bounds x="1180" y="162" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Edge_E1" bpmnElement="Flow_E1">
        <di:waypoint x="196" y="180" />
        <di:waypoint x="250" y="180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_E2" bpmnElement="Flow_E2">
        <di:waypoint x="390" y="180" />
        <di:waypoint x="440" y="180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_PolicyPass" bpmnElement="Flow_PolicyPass">
        <di:waypoint x="490" y="180" />
        <di:waypoint x="540" y="180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_PolicyFail" bpmnElement="Flow_PolicyFail">
        <di:waypoint x="465" y="205" />
        <di:waypoint x="465" y="270" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_E3" bpmnElement="Flow_E3">
        <di:waypoint x="670" y="180" />
        <di:waypoint x="720" y="180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_MgrApproved" bpmnElement="Flow_MgrApproved">
        <di:waypoint x="770" y="180" />
        <di:waypoint x="820" y="180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_MgrReject" bpmnElement="Flow_MgrReject">
        <di:waypoint x="745" y="205" />
        <di:waypoint x="745" y="310" />
        <di:waypoint x="530" y="310" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_ToEndReject" bpmnElement="Flow_ToEndReject">
        <di:waypoint x="530" y="310" />
        <di:waypoint x="580" y="310" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_E4" bpmnElement="Flow_E4">
        <di:waypoint x="950" y="180" />
        <di:waypoint x="1000" y="180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_EEnd" bpmnElement="Flow_EEnd">
        <di:waypoint x="1130" y="180" />
        <di:waypoint x="1180" y="180" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""
    }
]
