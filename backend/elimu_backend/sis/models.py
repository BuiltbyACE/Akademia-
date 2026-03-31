from django.db import models
from django.core.validators import RegexValidator
from tenants.base_models import TenantAwareTimestampedModel
from accounts.models import User
import uuid


class Student(TenantAwareTimestampedModel):
    """
    Core student record - single source of truth for learner information.
    """
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('transferred', 'Transferred'),
        ('graduated', 'Graduated'),
        ('expelled', 'Expelled'),
        ('withdrawn', 'Withdrawn'),
        ('deceased', 'Deceased'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Identification
    admission_number = models.CharField(max_length=50, db_index=True)
    national_id = models.CharField(max_length=50, blank=True, help_text="National ID or Birth Certificate Number")
    
    # Personal Information
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    
    # Contact Information
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    
    # Address
    address_line1 = models.CharField(max_length=255, blank=True)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    
    # Medical Information
    blood_group = models.CharField(max_length=5, blank=True)
    allergies = models.TextField(blank=True)
    medical_conditions = models.TextField(blank=True)
    
    # Emergency Contact
    emergency_contact_name = models.CharField(max_length=200, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    emergency_contact_relationship = models.CharField(max_length=50, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    admission_date = models.DateField()
    
    # Optional user account link (for student portal access)
    user = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='student_profile'
    )
    
    # Photo
    photo = models.ImageField(upload_to='student_photos/', null=True, blank=True)
    
    # Additional metadata
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'students'
        ordering = ['admission_number']
        unique_together = [['tenant', 'admission_number']]
        indexes = [
            models.Index(fields=['tenant', 'admission_number']),
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['first_name', 'last_name']),
        ]
    
    def __str__(self):
        return f"{self.admission_number} - {self.get_full_name()}"
    
    def get_full_name(self):
        if self.middle_name:
            return f"{self.first_name} {self.middle_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"
    
    def get_age(self):
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )


class Guardian(TenantAwareTimestampedModel):
    """
    Parent/Guardian information.
    """
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Personal Information
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    
    # Contact Information
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    alternate_phone = models.CharField(max_length=20, blank=True)
    
    # Address
    address_line1 = models.CharField(max_length=255, blank=True)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    
    # Professional Information
    occupation = models.CharField(max_length=100, blank=True)
    employer = models.CharField(max_length=200, blank=True)
    work_phone = models.CharField(max_length=20, blank=True)
    
    # Identification
    national_id = models.CharField(max_length=50, blank=True)
    
    # User account link (for parent portal access)
    user = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='guardian_profile'
    )
    
    # Photo
    photo = models.ImageField(upload_to='guardian_photos/', null=True, blank=True)
    
    class Meta:
        db_table = 'guardians'
        ordering = ['last_name', 'first_name']
        indexes = [
            models.Index(fields=['tenant', 'email']),
            models.Index(fields=['tenant', 'phone']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    def get_full_name(self):
        if self.middle_name:
            return f"{self.first_name} {self.middle_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"


class StudentGuardian(TenantAwareTimestampedModel):
    """
    Relationship mapping between students and guardians.
    """
    RELATIONSHIP_CHOICES = [
        ('father', 'Father'),
        ('mother', 'Mother'),
        ('guardian', 'Legal Guardian'),
        ('grandfather', 'Grandfather'),
        ('grandmother', 'Grandmother'),
        ('uncle', 'Uncle'),
        ('aunt', 'Aunt'),
        ('sibling', 'Sibling'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='guardian_relationships'
    )
    guardian = models.ForeignKey(
        Guardian,
        on_delete=models.CASCADE,
        related_name='student_relationships'
    )
    relationship = models.CharField(max_length=20, choices=RELATIONSHIP_CHOICES)
    is_primary = models.BooleanField(default=False, help_text="Primary contact for this student")
    is_emergency_contact = models.BooleanField(default=False)
    can_pickup = models.BooleanField(default=True, help_text="Authorized to pick up student")
    
    class Meta:
        db_table = 'student_guardians'
        unique_together = [['tenant', 'student', 'guardian']]
        indexes = [
            models.Index(fields=['tenant', 'student']),
            models.Index(fields=['tenant', 'guardian']),
        ]
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.guardian.get_full_name()} ({self.relationship})"


class Enrollment(TenantAwareTimestampedModel):
    """
    Student enrollment in a specific academic year and class.
    """
    STATUS_CHOICES = [
        ('enrolled', 'Enrolled'),
        ('promoted', 'Promoted'),
        ('repeated', 'Repeated'),
        ('transferred', 'Transferred'),
        ('withdrawn', 'Withdrawn'),
        ('completed', 'Completed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    academic_year = models.ForeignKey(
        'academics.AcademicYear',
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    class_assigned = models.ForeignKey(
        'academics.Class',
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    
    # Enrollment details
    enrollment_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='enrolled')
    
    # Roll number within the class
    roll_number = models.IntegerField(null=True, blank=True)
    
    # Promotion/Transfer details
    promoted_to = models.ForeignKey(
        'academics.Class',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='promoted_from_enrollments'
    )
    transfer_date = models.DateField(null=True, blank=True)
    transfer_reason = models.TextField(blank=True)
    
    class Meta:
        db_table = 'enrollments'
        unique_together = [['tenant', 'student', 'academic_year']]
        ordering = ['-academic_year', 'class_assigned', 'roll_number']
        indexes = [
            models.Index(fields=['tenant', 'academic_year', 'class_assigned']),
            models.Index(fields=['tenant', 'student']),
        ]
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.academic_year} - {self.class_assigned}"


class Document(TenantAwareTimestampedModel):
    """
    Uploaded documents for students (birth certificates, medical records, etc.)
    """
    DOCUMENT_TYPES = [
        ('birth_certificate', 'Birth Certificate'),
        ('national_id', 'National ID'),
        ('medical_report', 'Medical Report'),
        ('transfer_certificate', 'Transfer Certificate'),
        ('photo', 'Photograph'),
        ('report_card', 'Report Card'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='student_documents/')
    
    # Verification
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_documents'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='uploaded_documents'
    )
    
    class Meta:
        db_table = 'student_documents'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant', 'student']),
            models.Index(fields=['document_type']),
        ]
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.title}"


class StudentStatusHistory(TenantAwareTimestampedModel):
    """
    Track changes in student status over time.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='status_history'
    )
    
    previous_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    reason = models.TextField()
    effective_date = models.DateField()
    
    changed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='student_status_changes'
    )
    
    class Meta:
        db_table = 'student_status_history'
        ordering = ['-effective_date']
        indexes = [
            models.Index(fields=['tenant', 'student']),
        ]
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.previous_status} to {self.new_status}"
