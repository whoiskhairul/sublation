import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from bpmn.models import BPMNTemplate

TEMPLATES = [
    {
        "name": "Customer Order Fulfillment",
        "description": "<p>A complete end-to-end <strong>Order-to-Cash</strong> process that handles customer order verification, inventory reservation, credit card payment capture, packaging, and carrier dispatch with rejection handling.</p>",
        "xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_Order" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_OrderFulfillment" isExecutable="true">
    <bpmn:startEvent id="Start_OrderReceived" name="Order Received" />
    <bpmn:task id="Task_CheckInventory" name="Check Inventory" />
    <bpmn:exclusiveGateway id="Gateway_InStock" name="In Stock?" />
    <bpmn:task id="Task_ProcessPayment" name="Process Payment" />
    <bpmn:task id="Task_NotifyOutOfStock" name="Notify Out of Stock" />
    <bpmn:task id="Task_PackShip" name="Pack &amp; Dispatch Goods" />
    <bpmn:endEvent id="End_OrderFulfilled" name="Order Fulfilled" />
    <bpmn:endEvent id="End_OrderCancelled" name="Order Cancelled" />
    <bpmn:sequenceFlow id="Flow_1" sourceRef="Start_OrderReceived" targetRef="Task_CheckInventory" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_CheckInventory" targetRef="Gateway_InStock" />
    <bpmn:sequenceFlow id="Flow_Yes" name="Yes" sourceRef="Gateway_InStock" targetRef="Task_ProcessPayment" />
    <bpmn:sequenceFlow id="Flow_No" name="No" sourceRef="Gateway_InStock" targetRef="Task_NotifyOutOfStock" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Task_ProcessPayment" targetRef="Task_PackShip" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Task_PackShip" targetRef="End_OrderFulfilled" />
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_NotifyOutOfStock" targetRef="End_OrderCancelled" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_OrderFulfillment">
      <bpmndi:BPMNShape id="Start_OrderReceived_di" bpmnElement="Start_OrderReceived">
        <dc:Bounds x="160" y="182" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_CheckInventory_di" bpmnElement="Task_CheckInventory">
        <dc:Bounds x="250" y="160" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_InStock_di" bpmnElement="Gateway_InStock" isMarkerVisible="true">
        <dc:Bounds x="430" y="175" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_ProcessPayment_di" bpmnElement="Task_ProcessPayment">
        <dc:Bounds x="540" y="160" width="130" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_PackShip_di" bpmnElement="Task_PackShip">
        <dc:Bounds x="730" y="160" width="140" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_OrderFulfilled_di" bpmnElement="End_OrderFulfilled">
        <dc:Bounds x="930" y="182" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_NotifyOutOfStock_di" bpmnElement="Task_NotifyOutOfStock">
        <dc:Bounds x="540" y="290" width="130" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_OrderCancelled_di" bpmnElement="End_OrderCancelled">
        <dc:Bounds x="730" y="312" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="196" y="200" /><di:waypoint x="250" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="370" y="200" /><di:waypoint x="430" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Yes_di" bpmnElement="Flow_Yes">
        <di:waypoint x="480" y="200" /><di:waypoint x="540" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_No_di" bpmnElement="Flow_No">
        <di:waypoint x="455" y="225" /><di:waypoint x="455" y="330" /><di:waypoint x="540" y="330" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3">
        <di:waypoint x="670" y="200" /><di:waypoint x="730" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4">
        <di:waypoint x="870" y="200" /><di:waypoint x="930" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_5_di" bpmnElement="Flow_5">
        <di:waypoint x="670" y="330" /><di:waypoint x="730" y="330" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""
    },
    {
        "name": "Employee Onboarding Workflow",
        "description": "<p>A standardized corporate <strong>HR Onboarding</strong> workflow managing workspace provisioning, IT hardware setup, compliance signing, and welcome mentor introduction.</p>",
        "xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_Onboarding" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_EmployeeOnboarding" isExecutable="true">
    <bpmn:startEvent id="Start_Hire" name="New Employee Hired" />
    <bpmn:parallelGateway id="Gateway_Fork" name="Split Tasks" />
    <bpmn:task id="Task_ProvisionAccounts" name="Provision Email &amp; SSO" />
    <bpmn:task id="Task_PrepareLaptop" name="Configure IT Hardware" />
    <bpmn:task id="Task_CollectDocuments" name="Collect Tax &amp; ID Forms" />
    <bpmn:parallelGateway id="Gateway_Join" name="Sync Completion" />
    <bpmn:task id="Task_Orientation" name="First Day Orientation" />
    <bpmn:endEvent id="End_OnboardingComplete" name="Onboarding Complete" />
    <bpmn:sequenceFlow id="Flow_1" sourceRef="Start_Hire" targetRef="Gateway_Fork" />
    <bpmn:sequenceFlow id="Flow_A" sourceRef="Gateway_Fork" targetRef="Task_ProvisionAccounts" />
    <bpmn:sequenceFlow id="Flow_B" sourceRef="Gateway_Fork" targetRef="Task_PrepareLaptop" />
    <bpmn:sequenceFlow id="Flow_C" sourceRef="Gateway_Fork" targetRef="Task_CollectDocuments" />
    <bpmn:sequenceFlow id="Flow_A_out" sourceRef="Task_ProvisionAccounts" targetRef="Gateway_Join" />
    <bpmn:sequenceFlow id="Flow_B_out" sourceRef="Task_PrepareLaptop" targetRef="Gateway_Join" />
    <bpmn:sequenceFlow id="Flow_C_out" sourceRef="Task_CollectDocuments" targetRef="Gateway_Join" />
    <bpmn:sequenceFlow id="Flow_Join" sourceRef="Gateway_Join" targetRef="Task_Orientation" />
    <bpmn:sequenceFlow id="Flow_End" sourceRef="Task_Orientation" targetRef="End_OnboardingComplete" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_2">
    <bpmndi:BPMNPlane id="BPMNPlane_2" bpmnElement="Process_EmployeeOnboarding">
      <bpmndi:BPMNShape id="Start_Hire_di" bpmnElement="Start_Hire">
        <dc:Bounds x="140" y="202" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Fork_di" bpmnElement="Gateway_Fork">
        <dc:Bounds x="230" y="195" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_ProvisionAccounts_di" bpmnElement="Task_ProvisionAccounts">
        <dc:Bounds x="330" y="90" width="140" height="70" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_PrepareLaptop_di" bpmnElement="Task_PrepareLaptop">
        <dc:Bounds x="330" y="185" width="140" height="70" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_CollectDocuments_di" bpmnElement="Task_CollectDocuments">
        <dc:Bounds x="330" y="280" width="140" height="70" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Join_di" bpmnElement="Gateway_Join">
        <dc:Bounds x="520" y="195" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Orientation_di" bpmnElement="Task_Orientation">
        <dc:Bounds x="620" y="185" width="140" height="70" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_OnboardingComplete_di" bpmnElement="End_OnboardingComplete">
        <dc:Bounds x="820" y="202" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="176" y="220" /><di:waypoint x="230" y="220" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_A_di" bpmnElement="Flow_A">
        <di:waypoint x="255" y="195" /><di:waypoint x="255" y="125" /><di:waypoint x="330" y="125" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_B_di" bpmnElement="Flow_B">
        <di:waypoint x="280" y="220" /><di:waypoint x="330" y="220" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_C_di" bpmnElement="Flow_C">
        <di:waypoint x="255" y="245" /><di:waypoint x="255" y="315" /><di:waypoint x="330" y="315" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_A_out_di" bpmnElement="Flow_A_out">
        <di:waypoint x="470" y="125" /><di:waypoint x="545" y="125" /><di:waypoint x="545" y="195" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_B_out_di" bpmnElement="Flow_B_out">
        <di:waypoint x="470" y="220" /><di:waypoint x="520" y="220" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_C_out_di" bpmnElement="Flow_C_out">
        <di:waypoint x="470" y="315" /><di:waypoint x="545" y="315" /><di:waypoint x="545" y="245" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Join_di" bpmnElement="Flow_Join">
        <di:waypoint x="570" y="220" /><di:waypoint x="620" y="220" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_End_di" bpmnElement="Flow_End">
        <di:waypoint x="760" y="220" /><di:waypoint x="820" y="220" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""
    },
    {
        "name": "Invoice Approval & Settlement",
        "description": "<p>Enterprise <strong>Accounts Payable</strong> process with tiered approval thresholds based on invoice amounts (under vs. over $5,000) before ERP ledger posting.</p>",
        "xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_Invoice" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_InvoiceApproval" isExecutable="true">
    <bpmn:startEvent id="Start_Invoice" name="Invoice Scanned" />
    <bpmn:task id="Task_ThreeWayMatch" name="Three-Way Matching" />
    <bpmn:exclusiveGateway id="Gateway_Amount" name="Amount &gt; $5,000?" />
    <bpmn:task id="Task_ManagerSignoff" name="Manager Sign-off" />
    <bpmn:task id="Task_DirectorApproval" name="VP / Director Approval" />
    <bpmn:exclusiveGateway id="Gateway_Merge" />
    <bpmn:task id="Task_SchedulePayout" name="Schedule ACH Payment" />
    <bpmn:endEvent id="End_Settled" name="Invoice Settled" />
    <bpmn:sequenceFlow id="F1" sourceRef="Start_Invoice" targetRef="Task_ThreeWayMatch" />
    <bpmn:sequenceFlow id="F2" sourceRef="Task_ThreeWayMatch" targetRef="Gateway_Amount" />
    <bpmn:sequenceFlow id="F_Low" name="No" sourceRef="Gateway_Amount" targetRef="Task_ManagerSignoff" />
    <bpmn:sequenceFlow id="F_High" name="Yes" sourceRef="Gateway_Amount" targetRef="Task_DirectorApproval" />
    <bpmn:sequenceFlow id="F3" sourceRef="Task_ManagerSignoff" targetRef="Gateway_Merge" />
    <bpmn:sequenceFlow id="F4" sourceRef="Task_DirectorApproval" targetRef="Gateway_Merge" />
    <bpmn:sequenceFlow id="F5" sourceRef="Gateway_Merge" targetRef="Task_SchedulePayout" />
    <bpmn:sequenceFlow id="F6" sourceRef="Task_SchedulePayout" targetRef="End_Settled" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_3">
    <bpmndi:BPMNPlane id="BPMNPlane_3" bpmnElement="Process_InvoiceApproval">
      <bpmndi:BPMNShape id="Start_Invoice_di" bpmnElement="Start_Invoice">
        <dc:Bounds x="150" y="182" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_ThreeWayMatch_di" bpmnElement="Task_ThreeWayMatch">
        <dc:Bounds x="240" y="160" width="130" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Amount_di" bpmnElement="Gateway_Amount" isMarkerVisible="true">
        <dc:Bounds x="420" y="175" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_ManagerSignoff_di" bpmnElement="Task_ManagerSignoff">
        <dc:Bounds x="520" y="100" width="130" height="70" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_DirectorApproval_di" bpmnElement="Task_DirectorApproval">
        <dc:Bounds x="520" y="230" width="130" height="70" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Merge_di" bpmnElement="Gateway_Merge" isMarkerVisible="true">
        <dc:Bounds x="700" y="175" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_SchedulePayout_di" bpmnElement="Task_SchedulePayout">
        <dc:Bounds x="790" y="160" width="140" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Settled_di" bpmnElement="End_Settled">
        <dc:Bounds x="980" y="182" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="F1_di" bpmnElement="F1"><di:waypoint x="186" y="200" /><di:waypoint x="240" y="200" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F2_di" bpmnElement="F2"><di:waypoint x="370" y="200" /><di:waypoint x="420" y="200" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F_Low_di" bpmnElement="F_Low"><di:waypoint x="445" y="175" /><di:waypoint x="445" y="135" /><di:waypoint x="520" y="135" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F_High_di" bpmnElement="F_High"><di:waypoint x="445" y="225" /><di:waypoint x="445" y="265" /><di:waypoint x="520" y="265" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F3_di" bpmnElement="F3"><di:waypoint x="650" y="135" /><di:waypoint x="725" y="135" /><di:waypoint x="725" y="175" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F4_di" bpmnElement="F4"><di:waypoint x="650" y="265" /><di:waypoint x="725" y="265" /><di:waypoint x="725" y="225" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F5_di" bpmnElement="F5"><di:waypoint x="750" y="200" /><di:waypoint x="790" y="200" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F6_di" bpmnElement="F6"><di:waypoint x="930" y="200" /><di:waypoint x="980" y="200" /></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""
    },
    {
        "name": "IT Incident Management (ITIL)",
        "description": "<p>An <strong>IT Service Management</strong> standard incident workflow sorting tickets into Tier 1 resolution vs. Tier 2 escalation with root-cause documentation.</p>",
        "xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_Incident" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_IncidentManagement" isExecutable="true">
    <bpmn:startEvent id="Start_IncidentReported" name="Incident Logged" />
    <bpmn:task id="Task_Triage" name="Triage &amp; Categorize" />
    <bpmn:exclusiveGateway id="Gateway_Tier1CanResolve" name="Resolved by Tier 1?" />
    <bpmn:task id="Task_Tier2Investigation" name="Escalate to Tier 2 Engineering" />
    <bpmn:task id="Task_DeployFix" name="Deploy Workaround or Hotfix" />
    <bpmn:task id="Task_CommunicateUser" name="Notify User &amp; Verify" />
    <bpmn:endEvent id="End_IncidentClosed" name="Incident Closed" />
    <bpmn:sequenceFlow id="S1" sourceRef="Start_IncidentReported" targetRef="Task_Triage" />
    <bpmn:sequenceFlow id="S2" sourceRef="Task_Triage" targetRef="Gateway_Tier1CanResolve" />
    <bpmn:sequenceFlow id="S_No" name="No" sourceRef="Gateway_Tier1CanResolve" targetRef="Task_Tier2Investigation" />
    <bpmn:sequenceFlow id="S_Yes" name="Yes" sourceRef="Gateway_Tier1CanResolve" targetRef="Task_CommunicateUser" />
    <bpmn:sequenceFlow id="S3" sourceRef="Task_Tier2Investigation" targetRef="Task_DeployFix" />
    <bpmn:sequenceFlow id="S4" sourceRef="Task_DeployFix" targetRef="Task_CommunicateUser" />
    <bpmn:sequenceFlow id="S5" sourceRef="Task_CommunicateUser" targetRef="End_IncidentClosed" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_4">
    <bpmndi:BPMNPlane id="BPMNPlane_4" bpmnElement="Process_IncidentManagement">
      <bpmndi:BPMNShape id="Start_IncidentReported_di" bpmnElement="Start_IncidentReported"><dc:Bounds x="150" y="162" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Triage_di" bpmnElement="Task_Triage"><dc:Bounds x="240" y="140" width="130" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Tier1CanResolve_di" bpmnElement="Gateway_Tier1CanResolve" isMarkerVisible="true"><dc:Bounds x="420" y="155" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Tier2Investigation_di" bpmnElement="Task_Tier2Investigation"><dc:Bounds x="520" y="240" width="150" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_DeployFix_di" bpmnElement="Task_DeployFix"><dc:Bounds x="710" y="240" width="140" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_CommunicateUser_di" bpmnElement="Task_CommunicateUser"><dc:Bounds x="640" y="140" width="140" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_IncidentClosed_di" bpmnElement="End_IncidentClosed"><dc:Bounds x="840" y="162" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="S1_di" bpmnElement="S1"><di:waypoint x="186" y="180" /><di:waypoint x="240" y="180" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="S2_di" bpmnElement="S2"><di:waypoint x="370" y="180" /><di:waypoint x="420" y="180" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="S_Yes_di" bpmnElement="S_Yes"><di:waypoint x="470" y="180" /><di:waypoint x="640" y="180" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="S_No_di" bpmnElement="S_No"><di:waypoint x="445" y="205" /><di:waypoint x="445" y="280" /><di:waypoint x="520" y="280" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="S3_di" bpmnElement="S3"><di:waypoint x="670" y="280" /><di:waypoint x="710" y="280" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="S4_di" bpmnElement="S4"><di:waypoint x="780" y="240" /><di:waypoint x="780" y="210" /><di:waypoint x="780" y="200" /><di:waypoint x="780" y="180" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="S5_di" bpmnElement="S5"><di:waypoint x="780" y="180" /><di:waypoint x="840" y="180" /></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""
    },
    {
        "name": "Patient Clinical Appointment Booking",
        "description": "<p>Healthcare appointment scheduling flow checking physician clinic calendar availability, booking patient slots, and sending SMS reminders.</p>",
        "xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_Clinic" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_ClinicBooking" isExecutable="true">
    <bpmn:startEvent id="Start_BookingRequest" name="Request Received" />
    <bpmn:task id="Task_FindDoctor" name="Search Specialist Availability" />
    <bpmn:exclusiveGateway id="Gateway_SlotOpen" name="Slot Available?" />
    <bpmn:task id="Task_ConfirmBooking" name="Lock Calendar &amp; Reserve" />
    <bpmn:task id="Task_SuggestAlternatives" name="Propose Alternate Dates" />
    <bpmn:task id="Task_SendReminder" name="Send SMS &amp; Email Notice" />
    <bpmn:endEvent id="End_Booked" name="Appointment Confirmed" />
    <bpmn:sequenceFlow id="C1" sourceRef="Start_BookingRequest" targetRef="Task_FindDoctor" />
    <bpmn:sequenceFlow id="C2" sourceRef="Task_FindDoctor" targetRef="Gateway_SlotOpen" />
    <bpmn:sequenceFlow id="C_Yes" name="Yes" sourceRef="Gateway_SlotOpen" targetRef="Task_ConfirmBooking" />
    <bpmn:sequenceFlow id="C_No" name="No" sourceRef="Gateway_SlotOpen" targetRef="Task_SuggestAlternatives" />
    <bpmn:sequenceFlow id="C_Retry" sourceRef="Task_SuggestAlternatives" targetRef="Task_FindDoctor" />
    <bpmn:sequenceFlow id="C3" sourceRef="Task_ConfirmBooking" targetRef="Task_SendReminder" />
    <bpmn:sequenceFlow id="C4" sourceRef="Task_SendReminder" targetRef="End_Booked" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_5">
    <bpmndi:BPMNPlane id="BPMNPlane_5" bpmnElement="Process_ClinicBooking">
      <bpmndi:BPMNShape id="Start_BookingRequest_di" bpmnElement="Start_BookingRequest"><dc:Bounds x="150" y="162" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_FindDoctor_di" bpmnElement="Task_FindDoctor"><dc:Bounds x="240" y="140" width="140" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_SlotOpen_di" bpmnElement="Gateway_SlotOpen" isMarkerVisible="true"><dc:Bounds x="430" y="155" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_ConfirmBooking_di" bpmnElement="Task_ConfirmBooking"><dc:Bounds x="540" y="140" width="130" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_SuggestAlternatives_di" bpmnElement="Task_SuggestAlternatives"><dc:Bounds x="400" y="270" width="140" height="70" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_SendReminder_di" bpmnElement="Task_SendReminder"><dc:Bounds x="720" y="140" width="140" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Booked_di" bpmnElement="End_Booked"><dc:Bounds x="910" y="162" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="C1_di" bpmnElement="C1"><di:waypoint x="186" y="180" /><di:waypoint x="240" y="180" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="C2_di" bpmnElement="C2"><di:waypoint x="380" y="180" /><di:waypoint x="430" y="180" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="C_Yes_di" bpmnElement="C_Yes"><di:waypoint x="480" y="180" /><di:waypoint x="540" y="180" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="C_No_di" bpmnElement="C_No"><di:waypoint x="455" y="205" /><di:waypoint x="455" y="270" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="C_Retry_di" bpmnElement="C_Retry"><di:waypoint x="400" y="305" /><di:waypoint x="310" y="305" /><di:waypoint x="310" y="220" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="C3_di" bpmnElement="C3"><di:waypoint x="670" y="180" /><di:waypoint x="720" y="180" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="C4_di" bpmnElement="C4"><di:waypoint x="860" y="180" /><di:waypoint x="910" y="180" /></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""
    },
    {
        "name": "Software Feature Release Lifecycle",
        "description": "<p>A structured <strong>DevOps release pipeline</strong> encompassing code review, automated regression tests, staging deployment, and canary rollout.</p>",
        "xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_DevOps" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_SoftwareRelease" isExecutable="true">
    <bpmn:startEvent id="Start_PR" name="Pull Request Opened" />
    <bpmn:task id="Task_CodeReview" name="Peer Code Review" />
    <bpmn:task id="Task_RunCI" name="Automated CI &amp; Unit Tests" />
    <bpmn:exclusiveGateway id="Gateway_Passed" name="Tests Passed?" />
    <bpmn:task id="Task_FixDefects" name="Notify Developer of Failure" />
    <bpmn:task id="Task_StagingDeploy" name="Deploy to Staging" />
    <bpmn:task id="Task_ProductionRollout" name="Canary Production Rollout" />
    <bpmn:endEvent id="End_Shipped" name="Feature Released" />
    <bpmn:sequenceFlow id="D1" sourceRef="Start_PR" targetRef="Task_CodeReview" />
    <bpmn:sequenceFlow id="D2" sourceRef="Task_CodeReview" targetRef="Task_RunCI" />
    <bpmn:sequenceFlow id="D3" sourceRef="Task_RunCI" targetRef="Gateway_Passed" />
    <bpmn:sequenceFlow id="D_Pass" name="Yes" sourceRef="Gateway_Passed" targetRef="Task_StagingDeploy" />
    <bpmn:sequenceFlow id="D_Fail" name="No" sourceRef="Gateway_Passed" targetRef="Task_FixDefects" />
    <bpmn:sequenceFlow id="D_Recheck" sourceRef="Task_FixDefects" targetRef="Task_CodeReview" />
    <bpmn:sequenceFlow id="D4" sourceRef="Task_StagingDeploy" targetRef="Task_ProductionRollout" />
    <bpmn:sequenceFlow id="D5" sourceRef="Task_ProductionRollout" targetRef="End_Shipped" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_6">
    <bpmndi:BPMNPlane id="BPMNPlane_6" bpmnElement="Process_SoftwareRelease">
      <bpmndi:BPMNShape id="Start_PR_di" bpmnElement="Start_PR"><dc:Bounds x="140" y="172" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_CodeReview_di" bpmnElement="Task_CodeReview"><dc:Bounds x="220" y="150" width="130" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_RunCI_di" bpmnElement="Task_RunCI"><dc:Bounds x="390" y="150" width="140" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Passed_di" bpmnElement="Gateway_Passed" isMarkerVisible="true"><dc:Bounds x="570" y="165" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_FixDefects_di" bpmnElement="Task_FixDefects"><dc:Bounds x="530" y="270" width="130" height="70" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_StagingDeploy_di" bpmnElement="Task_StagingDeploy"><dc:Bounds x="670" y="150" width="130" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_ProductionRollout_di" bpmnElement="Task_ProductionRollout"><dc:Bounds x="840" y="150" width="140" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Shipped_di" bpmnElement="End_Shipped"><dc:Bounds x="1020" y="172" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="D1_di" bpmnElement="D1"><di:waypoint x="176" y="190" /><di:waypoint x="220" y="190" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="D2_di" bpmnElement="D2"><di:waypoint x="350" y="190" /><di:waypoint x="390" y="190" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="D3_di" bpmnElement="D3"><di:waypoint x="530" y="190" /><di:waypoint x="570" y="190" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="D_Pass_di" bpmnElement="D_Pass"><di:waypoint x="620" y="190" /><di:waypoint x="670" y="190" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="D_Fail_di" bpmnElement="D_Fail"><di:waypoint x="595" y="215" /><di:waypoint x="595" y="270" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="D_Recheck_di" bpmnElement="D_Recheck"><di:waypoint x="530" y="305" /><di:waypoint x="285" y="305" /><di:waypoint x="285" y="230" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="D4_di" bpmnElement="D4"><di:waypoint x="800" y="190" /><di:waypoint x="840" y="190" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="D5_di" bpmnElement="D5"><di:waypoint x="980" y="190" /><di:waypoint x="1020" y="190" /></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""
    },
    {
        "name": "Customer Support Ticket Resolution",
        "description": "<p>Omnichannel <strong>Helpdesk SLA</strong> resolution flow verifying customer subscription tiers and routing issues to specialized agents.</p>",
        "xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_Support" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_CustomerSupport" isExecutable="true">
    <bpmn:startEvent id="Start_TicketSubmitted" name="Ticket Submitted" />
    <bpmn:task id="Task_AnalyzeIntent" name="Analyze Intent &amp; SLA Tier" />
    <bpmn:exclusiveGateway id="Gateway_Priority" name="VIP / Enterprise?" />
    <bpmn:task id="Task_StandardQueue" name="Route to General Queue" />
    <bpmn:task id="Task_DedicatedAgent" name="Assign Dedicated CSM" />
    <bpmn:exclusiveGateway id="Gateway_ResolveMerge" />
    <bpmn:task id="Task_SendCSAT" name="Send CSAT Survey" />
    <bpmn:endEvent id="End_TicketResolved" name="Ticket Closed" />
    <bpmn:sequenceFlow id="T1" sourceRef="Start_TicketSubmitted" targetRef="Task_AnalyzeIntent" />
    <bpmn:sequenceFlow id="T2" sourceRef="Task_AnalyzeIntent" targetRef="Gateway_Priority" />
    <bpmn:sequenceFlow id="T_Normal" name="No" sourceRef="Gateway_Priority" targetRef="Task_StandardQueue" />
    <bpmn:sequenceFlow id="T_Vip" name="Yes" sourceRef="Gateway_Priority" targetRef="Task_DedicatedAgent" />
    <bpmn:sequenceFlow id="T3" sourceRef="Task_StandardQueue" targetRef="Gateway_ResolveMerge" />
    <bpmn:sequenceFlow id="T4" sourceRef="Task_DedicatedAgent" targetRef="Gateway_ResolveMerge" />
    <bpmn:sequenceFlow id="T5" sourceRef="Gateway_ResolveMerge" targetRef="Task_SendCSAT" />
    <bpmn:sequenceFlow id="T6" sourceRef="Task_SendCSAT" targetRef="End_TicketResolved" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_7">
    <bpmndi:BPMNPlane id="BPMNPlane_7" bpmnElement="Process_CustomerSupport">
      <bpmndi:BPMNShape id="Start_TicketSubmitted_di" bpmnElement="Start_TicketSubmitted"><dc:Bounds x="140" y="182" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_AnalyzeIntent_di" bpmnElement="Task_AnalyzeIntent"><dc:Bounds x="230" y="160" width="140" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Priority_di" bpmnElement="Gateway_Priority" isMarkerVisible="true"><dc:Bounds x="420" y="175" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_StandardQueue_di" bpmnElement="Task_StandardQueue"><dc:Bounds x="520" y="100" width="130" height="70" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_DedicatedAgent_di" bpmnElement="Task_DedicatedAgent"><dc:Bounds x="520" y="230" width="130" height="70" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_ResolveMerge_di" bpmnElement="Gateway_ResolveMerge" isMarkerVisible="true"><dc:Bounds x="690" y="175" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_SendCSAT_di" bpmnElement="Task_SendCSAT"><dc:Bounds x="780" y="160" width="130" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_TicketResolved_di" bpmnElement="End_TicketResolved"><dc:Bounds x="960" y="182" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="T1_di" bpmnElement="T1"><di:waypoint x="176" y="200" /><di:waypoint x="230" y="200" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="T2_di" bpmnElement="T2"><di:waypoint x="370" y="200" /><di:waypoint x="420" y="200" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="T_Normal_di" bpmnElement="T_Normal"><di:waypoint x="445" y="175" /><di:waypoint x="445" y="135" /><di:waypoint x="520" y="135" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="T_Vip_di" bpmnElement="T_Vip"><di:waypoint x="445" y="225" /><di:waypoint x="445" y="265" /><di:waypoint x="520" y="265" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="T3_di" bpmnElement="T3"><di:waypoint x="650" y="135" /><di:waypoint x="715" y="135" /><di:waypoint x="715" y="175" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="T4_di" bpmnElement="T4"><di:waypoint x="650" y="265" /><di:waypoint x="715" y="265" /><di:waypoint x="715" y="225" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="T5_di" bpmnElement="T5"><di:waypoint x="740" y="200" /><di:waypoint x="780" y="200" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="T6_di" bpmnElement="T6"><di:waypoint x="910" y="200" /><di:waypoint x="960" y="200" /></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""
    },
    {
        "name": "Employee Expense Reimbursement",
        "description": "<p>Financial travel and business <strong>Expense Claim</strong> auditing process with receipt verification and direct deposit payroll integration.</p>",
        "xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_Expense" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_ExpenseReimbursement" isExecutable="true">
    <bpmn:startEvent id="Start_ExpenseReport" name="Expense Claim Filed" />
    <bpmn:task id="Task_VerifyReceipts" name="Verify OCR Receipts" />
    <bpmn:exclusiveGateway id="Gateway_PolicyCompliant" name="Policy Compliant?" />
    <bpmn:task id="Task_RequestDetails" name="Request More Details" />
    <bpmn:task id="Task_DirectDeposit" name="Process Direct Deposit" />
    <bpmn:endEvent id="End_Reimbursed" name="Reimbursement Complete" />
    <bpmn:sequenceFlow id="E1" sourceRef="Start_ExpenseReport" targetRef="Task_VerifyReceipts" />
    <bpmn:sequenceFlow id="E2" sourceRef="Task_VerifyReceipts" targetRef="Gateway_PolicyCompliant" />
    <bpmn:sequenceFlow id="E_Valid" name="Yes" sourceRef="Gateway_PolicyCompliant" targetRef="Task_DirectDeposit" />
    <bpmn:sequenceFlow id="E_Invalid" name="No" sourceRef="Gateway_PolicyCompliant" targetRef="Task_RequestDetails" />
    <bpmn:sequenceFlow id="E_Resubmit" sourceRef="Task_RequestDetails" targetRef="Task_VerifyReceipts" />
    <bpmn:sequenceFlow id="E3" sourceRef="Task_DirectDeposit" targetRef="End_Reimbursed" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_8">
    <bpmndi:BPMNPlane id="BPMNPlane_8" bpmnElement="Process_ExpenseReimbursement">
      <bpmndi:BPMNShape id="Start_ExpenseReport_di" bpmnElement="Start_ExpenseReport"><dc:Bounds x="150" y="162" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_VerifyReceipts_di" bpmnElement="Task_VerifyReceipts"><dc:Bounds x="240" y="140" width="130" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_PolicyCompliant_di" bpmnElement="Gateway_PolicyCompliant" isMarkerVisible="true"><dc:Bounds x="420" y="155" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_DirectDeposit_di" bpmnElement="Task_DirectDeposit"><dc:Bounds x="530" y="140" width="140" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_RequestDetails_di" bpmnElement="Task_RequestDetails"><dc:Bounds x="400" y="260" width="130" height="70" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Reimbursed_di" bpmnElement="End_Reimbursed"><dc:Bounds x="730" y="162" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="E1_di" bpmnElement="E1"><di:waypoint x="186" y="180" /><di:waypoint x="240" y="180" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="E2_di" bpmnElement="E2"><di:waypoint x="370" y="180" /><di:waypoint x="420" y="180" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="E_Valid_di" bpmnElement="E_Valid"><di:waypoint x="470" y="180" /><di:waypoint x="530" y="180" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="E_Invalid_di" bpmnElement="E_Invalid"><di:waypoint x="445" y="205" /><di:waypoint x="445" y="260" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="E_Resubmit_di" bpmnElement="E_Resubmit"><di:waypoint x="400" y="295" /><di:waypoint x="305" y="295" /><di:waypoint x="305" y="220" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="E3_di" bpmnElement="E3"><di:waypoint x="670" y="180" /><di:waypoint x="730" y="180" /></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""
    },
    {
        "name": "Supplier Vendor Procurement",
        "description": "<p>Strategic <strong>B2B Vendor Sourcing</strong> pipeline including RFQ bidding, evaluation of vendor pricing, background checks, and contract execution.</p>",
        "xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_Procurement" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_Procurement" isExecutable="true">
    <bpmn:startEvent id="Start_ProcurementNeed" name="Requisition Submitted" />
    <bpmn:task id="Task_IssueRFQ" name="Publish Request For Quote" />
    <bpmn:task id="Task_ScoreProposals" name="Evaluate &amp; Score Bids" />
    <bpmn:exclusiveGateway id="Gateway_VendorSelected" name="Vendor Selected?" />
    <bpmn:task id="Task_NegotiateContract" name="Negotiate MSA &amp; SLA" />
    <bpmn:task id="Task_Reissue" name="Revise SOW" />
    <bpmn:task id="Task_SignContract" name="Execute Electronic Signature" />
    <bpmn:endEvent id="End_Procurement" name="Vendor Onboarded" />
    <bpmn:sequenceFlow id="P1" sourceRef="Start_ProcurementNeed" targetRef="Task_IssueRFQ" />
    <bpmn:sequenceFlow id="P2" sourceRef="Task_IssueRFQ" targetRef="Task_ScoreProposals" />
    <bpmn:sequenceFlow id="P3" sourceRef="Task_ScoreProposals" targetRef="Gateway_VendorSelected" />
    <bpmn:sequenceFlow id="P_Yes" name="Yes" sourceRef="Gateway_VendorSelected" targetRef="Task_NegotiateContract" />
    <bpmn:sequenceFlow id="P_No" name="No" sourceRef="Gateway_VendorSelected" targetRef="Task_Reissue" />
    <bpmn:sequenceFlow id="P_Loop" sourceRef="Task_Reissue" targetRef="Task_IssueRFQ" />
    <bpmn:sequenceFlow id="P4" sourceRef="Task_NegotiateContract" targetRef="Task_SignContract" />
    <bpmn:sequenceFlow id="P5" sourceRef="Task_SignContract" targetRef="End_Procurement" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_9">
    <bpmndi:BPMNPlane id="BPMNPlane_9" bpmnElement="Process_Procurement">
      <bpmndi:BPMNShape id="Start_ProcurementNeed_di" bpmnElement="Start_ProcurementNeed"><dc:Bounds x="140" y="172" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_IssueRFQ_di" bpmnElement="Task_IssueRFQ"><dc:Bounds x="220" y="150" width="130" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_ScoreProposals_di" bpmnElement="Task_ScoreProposals"><dc:Bounds x="390" y="150" width="130" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_VendorSelected_di" bpmnElement="Gateway_VendorSelected" isMarkerVisible="true"><dc:Bounds x="560" y="165" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_NegotiateContract_di" bpmnElement="Task_NegotiateContract"><dc:Bounds x="660" y="150" width="140" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Reissue_di" bpmnElement="Task_Reissue"><dc:Bounds x="520" y="270" width="130" height="70" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_SignContract_di" bpmnElement="Task_SignContract"><dc:Bounds x="840" y="150" width="130" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Procurement_di" bpmnElement="End_Procurement"><dc:Bounds x="1010" y="172" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="P1_di" bpmnElement="P1"><di:waypoint x="176" y="190" /><di:waypoint x="220" y="190" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="P2_di" bpmnElement="P2"><di:waypoint x="350" y="190" /><di:waypoint x="390" y="190" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="P3_di" bpmnElement="P3"><di:waypoint x="520" y="190" /><di:waypoint x="560" y="190" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="P_Yes_di" bpmnElement="P_Yes"><di:waypoint x="610" y="190" /><di:waypoint x="660" y="190" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="P_No_di" bpmnElement="P_No"><di:waypoint x="585" y="215" /><di:waypoint x="585" y="270" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="P_Loop_di" bpmnElement="P_Loop"><di:waypoint x="520" y="305" /><di:waypoint x="285" y="305" /><di:waypoint x="285" y="230" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="P4_di" bpmnElement="P4"><di:waypoint x="800" y="190" /><di:waypoint x="840" y="190" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="P5_di" bpmnElement="P5"><di:waypoint x="970" y="190" /><di:waypoint x="1010" y="190" /></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""
    },
    {
        "name": "Automated Loan Application Review",
        "description": "<p>FinTech credit evaluation process assessing customer debt-to-income metrics, credit bureau scoring, automated underwriting, and underwriting disbursement.</p>",
        "xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_Loan" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_LoanUnderwriting" isExecutable="true">
    <bpmn:startEvent id="Start_LoanApplied" name="Loan Application" />
    <bpmn:task id="Task_CreditCheck" name="Check Credit Score" />
    <bpmn:exclusiveGateway id="Gateway_Score" name="Credit Score &gt; 680?" />
    <bpmn:task id="Task_Underwrite" name="Automated Underwriting" />
    <bpmn:task id="Task_DeclineNotice" name="Send Adverse Action Letter" />
    <bpmn:task id="Task_Disburse" name="Disburse Funds to Account" />
    <bpmn:endEvent id="End_Approved" name="Loan Disbursed" />
    <bpmn:endEvent id="End_Declined" name="Application Declined" />
    <bpmn:sequenceFlow id="L1" sourceRef="Start_LoanApplied" targetRef="Task_CreditCheck" />
    <bpmn:sequenceFlow id="L2" sourceRef="Task_CreditCheck" targetRef="Gateway_Score" />
    <bpmn:sequenceFlow id="L_Pass" name="Yes" sourceRef="Gateway_Score" targetRef="Task_Underwrite" />
    <bpmn:sequenceFlow id="L_Fail" name="No" sourceRef="Gateway_Score" targetRef="Task_DeclineNotice" />
    <bpmn:sequenceFlow id="L3" sourceRef="Task_Underwrite" targetRef="Task_Disburse" />
    <bpmn:sequenceFlow id="L4" sourceRef="Task_Disburse" targetRef="End_Approved" />
    <bpmn:sequenceFlow id="L5" sourceRef="Task_DeclineNotice" targetRef="End_Declined" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_10">
    <bpmndi:BPMNPlane id="BPMNPlane_10" bpmnElement="Process_LoanUnderwriting">
      <bpmndi:BPMNShape id="Start_LoanApplied_di" bpmnElement="Start_LoanApplied"><dc:Bounds x="150" y="172" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_CreditCheck_di" bpmnElement="Task_CreditCheck"><dc:Bounds x="240" y="150" width="130" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Score_di" bpmnElement="Gateway_Score" isMarkerVisible="true"><dc:Bounds x="420" y="165" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Underwrite_di" bpmnElement="Task_Underwrite"><dc:Bounds x="530" y="150" width="140" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_DeclineNotice_di" bpmnElement="Task_DeclineNotice"><dc:Bounds x="530" y="270" width="140" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Disburse_di" bpmnElement="Task_Disburse"><dc:Bounds x="730" y="150" width="140" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Approved_di" bpmnElement="End_Approved"><dc:Bounds x="930" y="172" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Declined_di" bpmnElement="End_Declined"><dc:Bounds x="730" y="292" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="L1_di" bpmnElement="L1"><di:waypoint x="186" y="190" /><di:waypoint x="240" y="190" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="L2_di" bpmnElement="L2"><di:waypoint x="370" y="190" /><di:waypoint x="420" y="190" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="L_Pass_di" bpmnElement="L_Pass"><di:waypoint x="470" y="190" /><di:waypoint x="530" y="190" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="L_Fail_di" bpmnElement="L_Fail"><di:waypoint x="445" y="215" /><di:waypoint x="445" y="310" /><di:waypoint x="530" y="310" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="L3_di" bpmnElement="L3"><di:waypoint x="670" y="190" /><di:waypoint x="730" y="190" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="L4_di" bpmnElement="L4"><di:waypoint x="870" y="190" /><di:waypoint x="930" y="190" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="L5_di" bpmnElement="L5"><di:waypoint x="670" y="310" /><di:waypoint x="730" y="310" /></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""
    }
]

def bpmn_xml_to_svg(xml_content):
    import xml.etree.ElementTree as ET
    import html

    NS = {
        'bpmn': 'http://www.omg.org/spec/BPMN/20100524/MODEL',
        'bpmndi': 'http://www.omg.org/spec/BPMN/20100524/DI',
        'dc': 'http://www.omg.org/spec/DD/20100524/DC',
        'di': 'http://www.omg.org/spec/DD/20100524/DI',
    }

    root = ET.fromstring(xml_content)
    plane = root.find('.//bpmndi:BPMNPlane', NS)
    if plane is None:
        return ""

    element_map = {}
    for elem in root.iter():
        elem_id = elem.attrib.get('id')
        if elem_id:
            tag = elem.tag.split('}')[-1]
            element_map[elem_id] = {
                'tag': tag,
                'name': elem.attrib.get('name', ''),
                'element': elem
            }

    shapes = plane.findall('bpmndi:BPMNShape', NS)
    edges = plane.findall('bpmndi:BPMNEdge', NS)

    all_x, all_y = [], []
    for s in shapes:
        b = s.find('dc:Bounds', NS)
        if b is not None:
            x, y, w, h = float(b.attrib['x']), float(b.attrib['y']), float(b.attrib['width']), float(b.attrib['height'])
            all_x.extend([x, x + w])
            all_y.extend([y, y + h])

    for e in edges:
        for pt in e.findall('di:waypoint', NS):
            all_x.append(float(pt.attrib['x']))
            all_y.append(float(pt.attrib['y']))

    if not all_x or not all_y:
        return ""

    pad = 40
    min_x, max_x = min(all_x) - pad, max(all_x) + pad
    min_y, max_y = min(all_y) - pad, max(all_y) + pad
    width = max(max_x - min_x, 100)
    height = max(max_y - min_y, 100)

    svg_parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{min_x:.1f} {min_y:.1f} {width:.1f} {height:.1f}" width="100%" height="100%" style="background:#ffffff; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif;">',
        '<defs>',
        '  <marker id="arrowhead" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">',
        '    <polygon points="0 1.5, 8 4.5, 0 7.5" fill="#525f7f" />',
        '  </marker>',
        '  <filter id="card-shadow" x="-5%" y="-5%" width="115%" height="115%">',
        '    <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.08"/>',
        '  </filter>',
        '</defs>',
    ]

    # Render sequence flows / edges
    for e in edges:
        pts = e.findall('di:waypoint', NS)
        if len(pts) >= 2:
            coords = " ".join([f"{float(pt.attrib['x'])},{float(pt.attrib['y'])}" for pt in pts])
            svg_parts.append(f'<polyline points="{coords}" fill="none" stroke="#525f7f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#arrowhead)" />')

    # Render shapes
    for s in shapes:
        b = s.find('dc:Bounds', NS)
        if b is None:
            continue
        x, y, w, h = float(b.attrib['x']), float(b.attrib['y']), float(b.attrib['width']), float(b.attrib['height'])
        bpmn_el_id = s.attrib.get('bpmnElement')
        info = element_map.get(bpmn_el_id, {})
        tag = info.get('tag', '')
        name = info.get('name', '')

        if 'start' in tag.lower():
            cx = x + w / 2
            cy = y + h / 2
            r = min(w, h) / 2
            svg_parts.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="#ecfdf5" stroke="#10b981" stroke-width="2.5" />')
            if name:
                escaped = html.escape(name)
                svg_parts.append(f'<text x="{cx:.1f}" y="{cy + r + 18:.1f}" text-anchor="middle" fill="#1e293b" font-size="11" font-weight="600">{escaped}</text>')

        elif 'end' in tag.lower():
            cx = x + w / 2
            cy = y + h / 2
            r = min(w, h) / 2
            svg_parts.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="#fef2f2" stroke="#ef4444" stroke-width="4" />')
            if name:
                escaped = html.escape(name)
                svg_parts.append(f'<text x="{cx:.1f}" y="{cy + r + 18:.1f}" text-anchor="middle" fill="#1e293b" font-size="11" font-weight="600">{escaped}</text>')

        elif 'gateway' in tag.lower():
            cx = x + w / 2
            cy = y + h / 2
            points = f"{cx:.1f},{y:.1f} {x+w:.1f},{cy:.1f} {cx:.1f},{y+h:.1f} {x:.1f},{cy:.1f}"
            svg_parts.append(f'<polygon points="{points}" fill="#fffbeb" stroke="#f59e0b" stroke-width="2.5" stroke-linejoin="round" />')
            if 'parallel' in tag.lower():
                # Cross (+)
                arm = min(w, h) * 0.22
                svg_parts.append(f'<line x1="{cx - arm:.1f}" y1="{cy:.1f}" x2="{cx + arm:.1f}" y2="{cy:.1f}" stroke="#d97706" stroke-width="3" stroke-linecap="round" />')
                svg_parts.append(f'<line x1="{cx:.1f}" y1="{cy - arm:.1f}" x2="{cx:.1f}" y2="{cy + arm:.1f}" stroke="#d97706" stroke-width="3" stroke-linecap="round" />')
            else:
                # Exclusive X
                arm = min(w, h) * 0.18
                svg_parts.append(f'<line x1="{cx - arm:.1f}" y1="{cy - arm:.1f}" x2="{cx + arm:.1f}" y2="{cy + arm:.1f}" stroke="#d97706" stroke-width="3" stroke-linecap="round" />')
                svg_parts.append(f'<line x1="{cx - arm:.1f}" y1="{cy + arm:.1f}" x2="{cx + arm:.1f}" y2="{cy - arm:.1f}" stroke="#d97706" stroke-width="3" stroke-linecap="round" />')
            if name:
                escaped = html.escape(name)
                svg_parts.append(f'<text x="{cx:.1f}" y="{y - 10:.1f}" text-anchor="middle" fill="#1e293b" font-size="11" font-weight="600">{escaped}</text>')

        else:
            # Standard task / activity box
            svg_parts.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="10" ry="10" fill="#ffffff" stroke="#2563eb" stroke-width="2" filter="url(#card-shadow)" />')
            # Accent header line inside card
            svg_parts.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="4" rx="2" fill="#3b82f6" />')
            if name:
                words = name.split()
                lines = []
                current = ""
                for word in words:
                    test_line = f"{current} {word}".strip()
                    if len(test_line) > 18:
                        if current:
                            lines.append(current)
                        current = word
                    else:
                        current = test_line
                if current:
                    lines.append(current)

                line_height = 15
                total_text_h = len(lines) * line_height
                start_text_y = y + (h - total_text_h) / 2 + 11

                for idx, line in enumerate(lines):
                    escaped = html.escape(line)
                    svg_parts.append(f'<text x="{x + w / 2:.1f}" y="{start_text_y + idx * line_height:.1f}" text-anchor="middle" fill="#1e293b" font-size="12" font-weight="500">{escaped}</text>')

    svg_parts.append('</svg>')
    return "".join(svg_parts)


def seed():
    created_count = 0
    for t in TEMPLATES:
        svg_content = bpmn_xml_to_svg(t["xml"])
        obj, created = BPMNTemplate.objects.get_or_create(
            name=t["name"],
            defaults={
                "description": t["description"],
                "bpmn_xml": t["xml"],
                "bpmn_svg": svg_content
            }
        )
        if not created:
            obj.description = t["description"]
            obj.bpmn_xml = t["xml"]
            obj.bpmn_svg = svg_content
            obj.save()
        created_count += 1
        print(f"Seeded: {obj.name} (SVG length: {len(obj.bpmn_svg)})")
    print(f"Successfully seeded {created_count} templates with SVG!")

if __name__ == '__main__':
    seed()

