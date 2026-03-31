from django.db import models
from django.core.validators import MinValueValidator
from tenants.base_models import TenantAwareTimestampedModel
from accounts.models import User
from sis.models import Student
from academics.models import Class, Term
import uuid


class AttendanceSession(TenantAwareTimestampedModel):
    """
    Represents an attendance session (daily or per-period).
    """
    SESSION_TYPES = [
        ('daily', 'Daily'),
        ('period', 'Period'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    class_assigned = models.ForeignKey(
        Class,
        on_delete=models.CASCADE,
        related_name='attendance_sessions'
    )
    term = models.ForeignKey(
        Term,
        on_delete=models.CASCADE,
        related_name='attendance_sessions'
    )
    
    date = models.DateField(db_index=True)
    session_type = models.CharField(max_length=20, choices=SESSION_TYPES, default='daily')
    
    # For period-based attendance
    period_number = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1)]
    )
    period_name = models.CharField(max_length=100, blank=True)
    
    # Who marked the attendance
    marked_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='attendance_sessions_marked'
    )
    marked_at = models.DateTimeField(auto_now_add=True)
    
    # Status
    is_finalized = models.BooleanField(
        default=False,
        help_text="Once finalized, attendance cannot be changed"
    )
    
    class Meta:
        db_table = 'attendance_sessions'
        unique_together = [['tenant', 'class_assigned', 'date', 'session_type', 'period_number']]
        ordering = ['-date', 'class_assigned']
        indexes = [
            models.Index(fields=['tenant', 'date']),
            models.Index(fields=['tenant', 'class_assigned', 'date']),
        ]
    
    def __str__(self):
        if self.session_type == 'period':
            return f"{self.class_assigned} - {self.date} - Period {self.period_number}"
        return f"{self.class_assigned} - {self.date}"


class AttendanceRecord(TenantAwareTimestampedModel):
    """
    Individual attendance record for a student in a session.
    """
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('excused', 'Excused'),
        ('sick', 'Sick'),
        ('leave', 'On Leave'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        AttendanceSession,
        on_delete=models.CASCADE,
        related_name='records'
    )
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='attendance_records'
    )
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    
    # For late arrivals
    arrival_time = models.TimeField(null=True, blank=True)
    minutes_late = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )
    
    # Notes/Reason
    notes = models.TextField(blank=True)
    excuse_note = models.TextField(blank=True)
    
    # Notification sent to parent
    parent_notified = models.BooleanField(default=False)
    notification_sent_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'attendance_records'
        unique_together = [['tenant', 'session', 'student']]
        ordering = ['session', 'student']
        indexes = [
            models.Index(fields=['tenant', 'student']),
            models.Index(fields=['tenant', 'session']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.session.date} - {self.status}"


class AttendanceAlert(TenantAwareTimestampedModel):
    """
    Automated alerts for attendance patterns requiring intervention.
    """
    ALERT_TYPES = [
        ('consecutive_absence', 'Consecutive Absences'),
        ('chronic_lateness', 'Chronic Lateness'),
        ('low_attendance_rate', 'Low Attendance Rate'),
    ]
    
    SEVERITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='attendance_alerts'
    )
    
    alert_type = models.CharField(max_length=50, choices=ALERT_TYPES)
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS)
    
    # Alert details
    description = models.TextField()
    metric_value = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="e.g., number of consecutive absences or attendance percentage"
    )
    
    # Alert status
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_attendance_alerts'
    )
    resolution_notes = models.TextField(blank=True)
    
    # Notification
    parent_notified = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'attendance_alerts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant', 'student']),
            models.Index(fields=['tenant', 'is_resolved']),
            models.Index(fields=['severity']),
        ]
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.alert_type} ({self.severity})"


class AttendanceSummary(TenantAwareTimestampedModel):
    """
    Cached attendance summary statistics for students.
    Updated periodically for performance.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='attendance_summaries'
    )
    term = models.ForeignKey(
        Term,
        on_delete=models.CASCADE,
        related_name='attendance_summaries'
    )
    
    # Statistics
    total_sessions = models.IntegerField(default=0)
    present_count = models.IntegerField(default=0)
    absent_count = models.IntegerField(default=0)
    late_count = models.IntegerField(default=0)
    excused_count = models.IntegerField(default=0)
    
    # Calculated percentages
    attendance_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00
    )
    
    # Patterns
    consecutive_absences = models.IntegerField(default=0)
    last_absence_date = models.DateField(null=True, blank=True)
    
    # Last updated
    last_calculated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'attendance_summaries'
        unique_together = [['tenant', 'student', 'term']]
        ordering = ['student', '-term']
        indexes = [
            models.Index(fields=['tenant', 'student']),
            models.Index(fields=['tenant', 'term']),
        ]
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.term} - {self.attendance_percentage}%"
    
    def calculate_statistics(self):
        """Recalculate attendance statistics"""
        records = AttendanceRecord.objects.filter(
            tenant=self.tenant,
            student=self.student,
            session__term=self.term
        )
        
        self.total_sessions = records.count()
        self.present_count = records.filter(status='present').count()
        self.absent_count = records.filter(status='absent').count()
        self.late_count = records.filter(status='late').count()
        self.excused_count = records.filter(status='excused').count()
        
        if self.total_sessions > 0:
            self.attendance_percentage = (self.present_count / self.total_sessions) * 100
        else:
            self.attendance_percentage = 0
        
        self.save()
