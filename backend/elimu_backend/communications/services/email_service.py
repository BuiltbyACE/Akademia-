"""
Email service for sending email notifications.
Uses Django's email backend with support for templates.
"""
import logging
from django.core.mail import EmailMultiAlternatives, send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


class EmailService:
    """
    Service for sending email notifications.
    Supports both plain text and HTML emails.
    """
    
    def __init__(self):
        self.from_email = settings.DEFAULT_FROM_EMAIL
        self.site_name = settings.SITE_NAME
    
    def send_email(self, to_email, subject, message, html_message=None, from_email=None):
        """
        Send email to a recipient.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            message: Plain text message
            html_message: Optional HTML version of message
            from_email: Optional sender email (defaults to DEFAULT_FROM_EMAIL)
        
        Returns:
            dict: Response with status
        """
        try:
            sender = from_email or self.from_email
            
            if html_message:
                # Send multipart email (plain text + HTML)
                email = EmailMultiAlternatives(
                    subject=subject,
                    body=message,
                    from_email=sender,
                    to=[to_email]
                )
                email.attach_alternative(html_message, "text/html")
                email.send()
            else:
                # Send plain text email
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=sender,
                    recipient_list=[to_email],
                    fail_silently=False
                )
            
            logger.info(f"Email sent to {to_email}: {subject}")
            
            return {
                'success': True,
                'to_email': to_email,
                'subject': subject
            }
            
        except Exception as e:
            logger.error(f"Email sending failed to {to_email}: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'to_email': to_email
            }
    
    def send_template_email(self, to_email, subject, template_name, context, from_email=None):
        """
        Send email using Django template.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            template_name: Template file name (without extension)
            context: Template context dictionary
            from_email: Optional sender email
        
        Returns:
            dict: Response with status
        """
        try:
            # Add site name to context
            context['site_name'] = self.site_name
            context['site_url'] = settings.FRONTEND_URL
            
            # Render HTML template
            html_message = render_to_string(f'emails/{template_name}.html', context)
            
            # Create plain text version by stripping HTML
            plain_message = strip_tags(html_message)
            
            return self.send_email(
                to_email=to_email,
                subject=subject,
                message=plain_message,
                html_message=html_message,
                from_email=from_email
            )
            
        except Exception as e:
            logger.error(f"Template email sending failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'to_email': to_email
            }
    
    def send_bulk_email(self, recipients, subject, message, html_message=None):
        """
        Send email to multiple recipients.
        
        Args:
            recipients: List of email addresses
            subject: Email subject
            message: Plain text message
            html_message: Optional HTML message
        
        Returns:
            dict: Summary of sent emails
        """
        results = {
            'total': len(recipients),
            'successful': 0,
            'failed': 0,
            'details': []
        }
        
        for email in recipients:
            try:
                result = self.send_email(email, subject, message, html_message)
                
                if result['success']:
                    results['successful'] += 1
                else:
                    results['failed'] += 1
                
                results['details'].append(result)
                
            except Exception as e:
                results['failed'] += 1
                results['details'].append({
                    'success': False,
                    'to_email': email,
                    'error': str(e)
                })
                logger.error(f"Failed to send email to {email}: {str(e)}")
        
        return results
    
    def send_email_with_attachment(self, to_email, subject, message, attachment_path, 
                                   attachment_name=None, html_message=None):
        """
        Send email with file attachment.
        
        Args:
            to_email: Recipient email
            subject: Email subject
            message: Plain text message
            attachment_path: Path to attachment file
            attachment_name: Optional custom attachment name
            html_message: Optional HTML message
        
        Returns:
            dict: Response with status
        """
        try:
            email = EmailMultiAlternatives(
                subject=subject,
                body=message,
                from_email=self.from_email,
                to=[to_email]
            )
            
            if html_message:
                email.attach_alternative(html_message, "text/html")
            
            # Attach file
            email.attach_file(attachment_path, mimetype=None)
            
            email.send()
            
            logger.info(f"Email with attachment sent to {to_email}")
            
            return {
                'success': True,
                'to_email': to_email,
                'subject': subject,
                'attachment': attachment_path
            }
            
        except Exception as e:
            logger.error(f"Email with attachment failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'to_email': to_email
            }
    
    def validate_email(self, email):
        """
        Validate email address format.
        
        Args:
            email: Email address to validate
        
        Returns:
            bool: True if valid, False otherwise
        """
        import re
        
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    def send_payment_receipt(self, to_email, payment_data):
        """
        Send payment receipt email.
        
        Args:
            to_email: Recipient email
            payment_data: Dictionary with payment information
        
        Returns:
            dict: Response with status
        """
        context = {
            'payment_reference': payment_data.get('payment_reference'),
            'amount': payment_data.get('amount'),
            'currency': payment_data.get('currency'),
            'payment_date': payment_data.get('payment_date'),
            'student_name': payment_data.get('student_name'),
            'invoice_number': payment_data.get('invoice_number'),
            'balance': payment_data.get('balance'),
        }
        
        return self.send_template_email(
            to_email=to_email,
            subject=f'Payment Receipt - {payment_data.get("payment_reference")}',
            template_name='payment_receipt',
            context=context
        )
    
    def send_fee_reminder(self, to_email, reminder_data):
        """
        Send fee payment reminder email.
        
        Args:
            to_email: Recipient email
            reminder_data: Dictionary with reminder information
        
        Returns:
            dict: Response with status
        """
        context = {
            'student_name': reminder_data.get('student_name'),
            'invoice_number': reminder_data.get('invoice_number'),
            'amount_due': reminder_data.get('amount_due'),
            'currency': reminder_data.get('currency'),
            'due_date': reminder_data.get('due_date'),
            'days_overdue': reminder_data.get('days_overdue', 0),
        }
        
        return self.send_template_email(
            to_email=to_email,
            subject=f'Fee Payment Reminder - {reminder_data.get("student_name")}',
            template_name='fee_reminder',
            context=context
        )
    
    def send_attendance_alert(self, to_email, alert_data):
        """
        Send attendance alert email.
        
        Args:
            to_email: Recipient email
            alert_data: Dictionary with alert information
        
        Returns:
            dict: Response with status
        """
        context = {
            'student_name': alert_data.get('student_name'),
            'alert_type': alert_data.get('alert_type'),
            'date': alert_data.get('date'),
            'status': alert_data.get('status'),
            'message': alert_data.get('message'),
        }
        
        return self.send_template_email(
            to_email=to_email,
            subject=f'Attendance Alert - {alert_data.get("student_name")}',
            template_name='attendance_alert',
            context=context
        )
