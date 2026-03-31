"""
Template service for managing notification templates.
Handles template rendering with variable substitution.
"""
import logging
import re
from communications.models import NotificationTemplate
from tenants.utils import get_current_tenant

logger = logging.getLogger(__name__)


class TemplateService:
    """
    Service for managing and rendering notification templates.
    Supports variable substitution using {{variable}} syntax.
    """
    
    def render_template(self, template_text, context):
        """
        Render template with context variables.
        
        Args:
            template_text: Template string with {{variable}} placeholders
            context: Dictionary of variables to substitute
        
        Returns:
            str: Rendered template
        """
        if not template_text:
            return ""
        
        rendered = template_text
        
        # Find all {{variable}} patterns
        pattern = r'\{\{(\w+)\}\}'
        matches = re.findall(pattern, template_text)
        
        for var_name in matches:
            value = context.get(var_name, '')
            rendered = rendered.replace(f'{{{{{var_name}}}}}', str(value))
        
        return rendered
    
    def get_template(self, template_type, channel='sms'):
        """
        Get notification template by type.
        
        Args:
            template_type: Template type (e.g., 'fee_reminder', 'attendance_alert')
            channel: Communication channel ('sms' or 'email')
        
        Returns:
            NotificationTemplate object or None
        """
        tenant = get_current_tenant()
        
        try:
            template = NotificationTemplate.objects.get(
                tenant=tenant,
                template_type=template_type,
                is_active=True
            )
            return template
        except NotificationTemplate.DoesNotExist:
            logger.warning(f"Template not found: {template_type} for tenant {tenant.id}")
            return None
    
    def render_notification(self, template_type, context, channel='sms'):
        """
        Render notification from template.
        
        Args:
            template_type: Template type
            context: Context variables
            channel: Communication channel
        
        Returns:
            dict: Rendered subject and message
        """
        template = self.get_template(template_type, channel)
        
        if not template:
            # Return default message if template not found
            return {
                'subject': context.get('subject', 'Notification'),
                'message': context.get('message', ''),
                'template': None
            }
        
        if channel == 'sms':
            message = self.render_template(template.sms_template, context)
            return {
                'subject': '',
                'message': message,
                'template': template
            }
        elif channel == 'email':
            subject = self.render_template(template.subject, context)
            message = self.render_template(template.email_template, context)
            return {
                'subject': subject,
                'message': message,
                'template': template
            }
        
        return {
            'subject': '',
            'message': '',
            'template': None
        }
    
    def create_default_templates(self, tenant):
        """
        Create default notification templates for a tenant.
        
        Args:
            tenant: Tenant object
        
        Returns:
            list: Created templates
        """
        default_templates = [
            {
                'name': 'Fee Payment Reminder',
                'template_type': 'fee_reminder',
                'subject': 'Fee Payment Reminder - {{student_name}}',
                'sms_template': (
                    'Dear {{guardian_name}}, fee payment for {{student_name}} '
                    'is due. Invoice: {{invoice_number}}, Amount: {{currency}} {{amount}}. '
                    'Due date: {{due_date}}. Please pay to avoid penalties.'
                ),
                'email_template': (
                    'Dear {{guardian_name}},\n\n'
                    'This is a reminder that fee payment for {{student_name}} is due.\n\n'
                    'Invoice Number: {{invoice_number}}\n'
                    'Amount Due: {{currency}} {{amount}}\n'
                    'Due Date: {{due_date}}\n\n'
                    'Please make payment at your earliest convenience to avoid late penalties.\n\n'
                    'Thank you,\n{{school_name}}'
                )
            },
            {
                'name': 'Payment Confirmation',
                'template_type': 'payment_confirmation',
                'subject': 'Payment Received - {{student_name}}',
                'sms_template': (
                    'Payment of {{currency}} {{amount}} received for {{student_name}}. '
                    'Receipt: {{receipt_number}}. Balance: {{currency}} {{balance}}. '
                    'Thank you!'
                ),
                'email_template': (
                    'Dear {{guardian_name}},\n\n'
                    'We confirm receipt of your payment for {{student_name}}.\n\n'
                    'Payment Details:\n'
                    'Amount Paid: {{currency}} {{amount}}\n'
                    'Receipt Number: {{receipt_number}}\n'
                    'Payment Date: {{payment_date}}\n'
                    'Remaining Balance: {{currency}} {{balance}}\n\n'
                    'Thank you for your payment.\n\n'
                    'Best regards,\n{{school_name}}'
                )
            },
            {
                'name': 'Attendance Alert',
                'template_type': 'attendance_alert',
                'subject': 'Attendance Alert - {{student_name}}',
                'sms_template': (
                    'Attendance alert for {{student_name}} on {{date}}. '
                    'Status: {{status}}. {{message}}'
                ),
                'email_template': (
                    'Dear {{guardian_name}},\n\n'
                    'This is an attendance notification for {{student_name}}.\n\n'
                    'Date: {{date}}\n'
                    'Status: {{status}}\n'
                    'Details: {{message}}\n\n'
                    'If you have any questions, please contact the school.\n\n'
                    'Regards,\n{{school_name}}'
                )
            },
            {
                'name': 'Exam Schedule Notification',
                'template_type': 'exam_schedule',
                'subject': 'Exam Schedule - {{student_name}}',
                'sms_template': (
                    'Exam schedule for {{student_name}}: {{exam_name}} on {{exam_date}} '
                    'at {{exam_time}}. Venue: {{venue}}.'
                ),
                'email_template': (
                    'Dear {{guardian_name}},\n\n'
                    'Exam schedule for {{student_name}}:\n\n'
                    'Exam: {{exam_name}}\n'
                    'Date: {{exam_date}}\n'
                    'Time: {{exam_time}}\n'
                    'Venue: {{venue}}\n\n'
                    'Please ensure your child is well prepared.\n\n'
                    'Best wishes,\n{{school_name}}'
                )
            },
            {
                'name': 'Behavior Alert',
                'template_type': 'behavior_alert',
                'subject': 'Behavior Alert - {{student_name}}',
                'sms_template': (
                    'Behavior alert for {{student_name}}: {{incident_type}} on {{date}}. '
                    'Please contact the school.'
                ),
                'email_template': (
                    'Dear {{guardian_name}},\n\n'
                    'We need to inform you about a behavior incident involving {{student_name}}.\n\n'
                    'Incident Type: {{incident_type}}\n'
                    'Date: {{date}}\n'
                    'Description: {{description}}\n'
                    'Action Taken: {{action_taken}}\n\n'
                    'Please contact the school to discuss this matter.\n\n'
                    'Regards,\n{{school_name}}'
                )
            },
            {
                'name': 'General Announcement',
                'template_type': 'general_announcement',
                'subject': '{{announcement_title}}',
                'sms_template': '{{message}}',
                'email_template': (
                    'Dear {{recipient_name}},\n\n'
                    '{{message}}\n\n'
                    'Best regards,\n{{school_name}}'
                )
            }
        ]
        
        created_templates = []
        
        for template_data in default_templates:
            try:
                template = NotificationTemplate.objects.create(
                    tenant=tenant,
                    **template_data
                )
                created_templates.append(template)
                logger.info(f"Created template: {template.name} for tenant {tenant.name}")
            except Exception as e:
                logger.error(f"Failed to create template {template_data['name']}: {str(e)}")
        
        return created_templates
    
    def validate_template(self, template_text):
        """
        Validate template syntax.
        
        Args:
            template_text: Template string to validate
        
        Returns:
            tuple: (is_valid, errors)
        """
        errors = []
        
        if not template_text:
            errors.append("Template text is empty")
            return False, errors
        
        # Check for unclosed braces
        open_braces = template_text.count('{{')
        close_braces = template_text.count('}}')
        
        if open_braces != close_braces:
            errors.append(f"Mismatched braces: {open_braces} opening, {close_braces} closing")
        
        # Check for valid variable names
        pattern = r'\{\{(\w+)\}\}'
        matches = re.findall(pattern, template_text)
        
        for var_name in matches:
            if not var_name.isidentifier():
                errors.append(f"Invalid variable name: {var_name}")
        
        is_valid = len(errors) == 0
        return is_valid, errors
    
    def get_template_variables(self, template_text):
        """
        Extract all variables from a template.
        
        Args:
            template_text: Template string
        
        Returns:
            list: List of variable names
        """
        pattern = r'\{\{(\w+)\}\}'
        matches = re.findall(pattern, template_text)
        return list(set(matches))  # Remove duplicates
