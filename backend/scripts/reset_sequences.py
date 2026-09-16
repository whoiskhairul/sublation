import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

SQL_COMMANDS = [
    """SELECT setval(pg_get_serial_sequence('"bpmn_folder"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "bpmn_folder";""",
    """SELECT setval(pg_get_serial_sequence('"bpmn_bpmndiagram"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "bpmn_bpmndiagram";""",
    """SELECT setval(pg_get_serial_sequence('"bpmn_diagramshare"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "bpmn_diagramshare";""",
    """SELECT setval(pg_get_serial_sequence('"bpmn_bpmnconversation"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "bpmn_bpmnconversation";""",
    """SELECT setval(pg_get_serial_sequence('"bpmn_message"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "bpmn_message";""",
    """SELECT setval(pg_get_serial_sequence('"bpmn_diagramversion"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "bpmn_diagramversion";""",
    """SELECT setval(pg_get_serial_sequence('"bpmn_bpmntemplate"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "bpmn_bpmntemplate";""",
    """SELECT setval(pg_get_serial_sequence('"appointment_chatbot_doctor"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "appointment_chatbot_doctor";""",
    """SELECT setval(pg_get_serial_sequence('"appointment_chatbot_appointment"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "appointment_chatbot_appointment";""",
    """SELECT setval(pg_get_serial_sequence('"appointment_chatbot_personainstruction"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "appointment_chatbot_personainstruction";""",
    """SELECT setval(pg_get_serial_sequence('"authentication_user_groups"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "authentication_user_groups";""",
    """SELECT setval(pg_get_serial_sequence('"authentication_user_user_permissions"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "authentication_user_user_permissions";""",
    """SELECT setval(pg_get_serial_sequence('"authentication_user"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "authentication_user";""",
]

def reset_sequences():
    with connection.cursor() as cursor:
        for sql in SQL_COMMANDS:
            try:
                cursor.execute(sql)
                result = cursor.fetchone()
                print(f"Executed: {sql.split('FROM')[1].strip()} -> new next: {result}")
            except Exception as e:
                print(f"Error executing {sql}: {e}")

if __name__ == '__main__':
    reset_sequences()
