from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from tenants.base_models import TenantAwareTimestampedModel
from accounts.models import User
from sis.models import Student
from academics.models import Term, Subject, AcademicYear
import uuid


class ReportCard(TenantAwareTimestampedModel):
    """
    Student report cards for a term.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='report_cards'
    )
    term = models.ForeignKey(
        Term,
        on_delete=models.CASCADE,
        related_name='report_cards'
    )
    
    # Overall performance
    overall_average = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    overall_grade = models.CharField(max_length=5, blank=True)
    class_rank = models.IntegerField(null=True, blank=True)
    
    # Comments
    teacher_comment = models.TextField(blank=True)
    principal_comment = models.TextField(blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    published_at = models.DateTimeField(null=True, blank=True)
    
    # PDF generation
    pdf_file = models.FileField(upload_to='report_cards/', null=True, blank=True)
    
    class Meta:
        db_table = 'report_cards'
        unique_together = [['tenant', 'student', 'term']]
        ordering = ['-term', 'student']
        indexes = [
            models.Index(fields=['tenant', 'student']),
            models.Index(fields=['tenant', 'term']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.term}"


class SubjectGrade(TenantAwareTimestampedModel):
    """
    Individual subject grades for a report card.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report_card = models.ForeignKey(
        ReportCard,
        on_delete=models.CASCADE,
        related_name='subject_grades'
    )
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='grades'
    )
    
    # Scores
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    grade = models.CharField(max_length=5)
    
    # Teacher comment
    teacher_comment = models.TextField(blank=True)
    
    # Teacher who graded
    graded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='grades_given'
    )
    
    class Meta:
        db_table = 'subject_grades'
        unique_together = [['tenant', 'report_card', 'subject']]
        ordering = ['report_card', 'subject']
        indexes = [
            models.Index(fields=['tenant', 'report_card']),
        ]
    
    def __str__(self):
        return f"{self.subject.name} - {self.grade}"


class Transcript(TenantAwareTimestampedModel):
    """
    Official academic transcripts for students.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='transcripts'
    )
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name='transcripts'
    )
    
    # Transcript data (aggregated from report cards)
    transcript_data = models.JSONField(default=dict)
    
    # Overall statistics
    cumulative_gpa = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Generation
    generated_at = models.DateTimeField(auto_now_add=True)
    generated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='transcripts_generated'
    )
    
    # PDF
    pdf_file = models.FileField(upload_to='transcripts/', null=True, blank=True)
    
    # Verification
    is_official = models.BooleanField(default=False)
    verification_code = models.CharField(max_length=50, unique=True, blank=True)
    
    class Meta:
        db_table = 'transcripts'
        unique_together = [['tenant', 'student', 'academic_year']]
        ordering = ['-academic_year', 'student']
        indexes = [
            models.Index(fields=['tenant', 'student']),
            models.Index(fields=['verification_code']),
        ]
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.academic_year}"
