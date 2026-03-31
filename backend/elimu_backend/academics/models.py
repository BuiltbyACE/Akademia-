from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from tenants.base_models import TenantAwareTimestampedModel
from accounts.models import User
import uuid


class AcademicYear(TenantAwareTimestampedModel):
    """
    Represents an academic year (e.g., 2024-2025).
    """
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('active', 'Active'),
        ('completed', 'Completed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, help_text="e.g., 2024-2025")
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    
    # Make this the current active year
    is_current = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'academic_years'
        unique_together = [['tenant', 'name']]
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['tenant', 'is_current']),
        ]
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if self.is_current:
            AcademicYear.objects.filter(tenant=self.tenant, is_current=True).update(is_current=False)
        super().save(*args, **kwargs)


class Term(TenantAwareTimestampedModel):
    """
    Represents a term/semester within an academic year.
    """
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('active', 'Active'),
        ('completed', 'Completed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name='terms'
    )
    name = models.CharField(max_length=100, help_text="e.g., Term 1, Semester 1")
    term_number = models.IntegerField(validators=[MinValueValidator(1)])
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    
    class Meta:
        db_table = 'terms'
        unique_together = [['tenant', 'academic_year', 'term_number']]
        ordering = ['academic_year', 'term_number']
        indexes = [
            models.Index(fields=['tenant', 'academic_year']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.academic_year.name} - {self.name}"


class Grade(TenantAwareTimestampedModel):
    """
    Represents a grade level (e.g., Grade 1, Form 1, Year 7).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, help_text="e.g., Grade 1, Form 1")
    level = models.IntegerField(help_text="Numeric level for ordering (1, 2, 3...)")
    description = models.TextField(blank=True)
    
    # Some grades might be for specific education levels
    education_level = models.CharField(
        max_length=50,
        blank=True,
        help_text="e.g., Primary, Secondary, High School"
    )
    
    class Meta:
        db_table = 'grades'
        unique_together = [['tenant', 'name']]
        ordering = ['level']
        indexes = [
            models.Index(fields=['tenant', 'level']),
        ]
    
    def __str__(self):
        return self.name


class Class(TenantAwareTimestampedModel):
    """
    Represents a class/stream (e.g., Grade 5A, Form 3 Science).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    grade = models.ForeignKey(
        Grade,
        on_delete=models.CASCADE,
        related_name='classes'
    )
    name = models.CharField(max_length=100, help_text="e.g., 5A, 3 Science")
    
    # Class teacher
    class_teacher = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='classes_as_teacher'
    )
    
    # Capacity
    max_capacity = models.IntegerField(
        default=40,
        validators=[MinValueValidator(1)]
    )
    
    # Room/Location
    room_number = models.CharField(max_length=50, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'classes'
        unique_together = [['tenant', 'grade', 'name']]
        ordering = ['grade', 'name']
        indexes = [
            models.Index(fields=['tenant', 'grade']),
            models.Index(fields=['is_active']),
        ]
        verbose_name_plural = 'Classes'
    
    def __str__(self):
        return f"{self.grade.name} - {self.name}"
    
    def get_current_enrollment_count(self):
        """Get current number of enrolled students"""
        from sis.models import Enrollment
        from django.db.models import Q
        return Enrollment.objects.filter(
            tenant=self.tenant,
            class_assigned=self,
            status__in=['enrolled', 'promoted']
        ).count()


class Subject(TenantAwareTimestampedModel):
    """
    Represents a subject/course (e.g., Mathematics, English, Biology).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, help_text="Subject code (e.g., MATH101)")
    description = models.TextField(blank=True)
    
    # Subject categorization
    category = models.CharField(
        max_length=50,
        blank=True,
        help_text="e.g., Science, Language, Arts"
    )
    
    # Some subjects might be optional
    is_core = models.BooleanField(
        default=True,
        help_text="Core subjects are mandatory"
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'subjects'
        unique_together = [['tenant', 'code']]
        ordering = ['name']
        indexes = [
            models.Index(fields=['tenant', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class ClassSubject(TenantAwareTimestampedModel):
    """
    Maps subjects to classes (which subjects are taught in which class).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    class_assigned = models.ForeignKey(
        Class,
        on_delete=models.CASCADE,
        related_name='subject_assignments'
    )
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='class_assignments'
    )
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name='class_subjects'
    )
    
    # Teaching hours per week
    hours_per_week = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        default=0,
        validators=[MinValueValidator(0)]
    )
    
    class Meta:
        db_table = 'class_subjects'
        unique_together = [['tenant', 'class_assigned', 'subject', 'academic_year']]
        ordering = ['class_assigned', 'subject']
        indexes = [
            models.Index(fields=['tenant', 'class_assigned']),
            models.Index(fields=['tenant', 'academic_year']),
        ]
    
    def __str__(self):
        return f"{self.class_assigned} - {self.subject.name}"


class TeacherAssignment(TenantAwareTimestampedModel):
    """
    Assigns teachers to subjects in specific classes.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='subject_assignments'
    )
    class_subject = models.ForeignKey(
        ClassSubject,
        on_delete=models.CASCADE,
        related_name='teacher_assignments'
    )
    
    # Assignment period
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'teacher_assignments'
        unique_together = [['tenant', 'teacher', 'class_subject']]
        ordering = ['class_subject', 'teacher']
        indexes = [
            models.Index(fields=['tenant', 'teacher']),
            models.Index(fields=['tenant', 'class_subject']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.teacher.get_full_name()} - {self.class_subject}"


class GradingScale(TenantAwareTimestampedModel):
    """
    Defines grading scales/rubrics for the tenant.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, help_text="e.g., Standard Grading, IB Grading")
    description = models.TextField(blank=True)
    
    # Grading configuration stored as JSON
    # Example: [{"grade": "A", "min": 90, "max": 100, "gpa": 4.0}, ...]
    scale_config = models.JSONField(
        default=list,
        help_text="Grading scale configuration"
    )
    
    # Pass mark
    pass_mark = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=50.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    # Default scale for the tenant
    is_default = models.BooleanField(default=False)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'grading_scales'
        unique_together = [['tenant', 'name']]
        ordering = ['name']
        indexes = [
            models.Index(fields=['tenant', 'is_default']),
        ]
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if self.is_default:
            GradingScale.objects.filter(tenant=self.tenant, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)
    
    def get_grade_for_score(self, score):
        """Get letter grade for a numeric score"""
        for grade_config in self.scale_config:
            if grade_config['min'] <= score <= grade_config['max']:
                return grade_config['grade']
        return 'F'


class PromotionRule(TenantAwareTimestampedModel):
    """
    Defines rules for student promotion from one grade to another.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    from_grade = models.ForeignKey(
        Grade,
        on_delete=models.CASCADE,
        related_name='promotion_rules_from'
    )
    to_grade = models.ForeignKey(
        Grade,
        on_delete=models.CASCADE,
        related_name='promotion_rules_to'
    )
    
    # Promotion criteria
    minimum_average = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Minimum average score required"
    )
    
    # Additional criteria stored as JSON
    additional_criteria = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional promotion criteria"
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'promotion_rules'
        unique_together = [['tenant', 'from_grade', 'to_grade']]
        ordering = ['from_grade', 'to_grade']
        indexes = [
            models.Index(fields=['tenant', 'from_grade']),
        ]
    
    def __str__(self):
        return f"{self.from_grade} → {self.to_grade}"
