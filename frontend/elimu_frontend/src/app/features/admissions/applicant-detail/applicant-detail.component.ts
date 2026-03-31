import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdmissionsService } from '../../../core/services/admissions.service';
import { ApplicantDetail, InterviewAssessment, DocumentChecklistItem } from '../../../core/models/admissions.model';

@Component({
  selector: 'app-applicant-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './applicant-detail.component.html',
  styleUrl: './applicant-detail.component.css'
})
export class ApplicantDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private admissionsService = inject(AdmissionsService);

  applicant = signal<ApplicantDetail | null>(null);
  loading = signal(true);
  interviewAssessment = signal<InterviewAssessment | null>(null);
  documents = signal<DocumentChecklistItem[]>([]);
  newNote = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadApplicant(id);
    }
  }

  loadApplicant(id: string) {
    this.loading.set(true);
    this.admissionsService.getApplicant(id).subscribe({
      next: (data) => {
        this.applicant.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load applicant:', err);
        this.loading.set(false);
        this.loadMockData();
      }
    });
  }

  loadMockData() {
    const mockApplicant: ApplicantDetail = {
      id: '1',
      name: 'Julian Thorne',
      grade: 'Grade 10 Applicant',
      program: '',
      applied_date: '',
      priority: 'standard',
      status_badge: 'INTERVIEWING',
      interview_scheduled: true,
      interview_date: 'Tomorrow',
      interview_time: '10:30 AM',
      assigned_to: '',
      notes: '',
      contact_email: 'julian.thorne@email.com',
      contact_phone: '+1 (555) 123-4567',
      parent_name: 'Marcus Thorne',
      parent_email: 'marcus.thorne@email.com',
      parent_phone: '+1 (555) 123-4567',
      date_of_birth: '2009-05-15',
      previous_school: 'Lincoln Academy',
      test_scores: [
        { test_name: 'Math Placement', score: 92, max_score: 100, date: '2024-09-15' },
        { test_name: 'English Proficiency', score: 88, max_score: 100, date: '2024-09-15' }
      ],
      documents: [
        { id: '1', name: 'Birth Certificate', type: 'pdf', uploaded_date: '2024-09-01', verified: true },
        { id: '2', name: 'Previous Grades', type: 'pdf', uploaded_date: '2024-09-01', verified: true },
        { id: '3', name: 'Medical Records', type: 'pdf', uploaded_date: '2024-09-05', verified: false },
        { id: '4', name: 'Letter of Recommendation', type: 'pdf', uploaded_date: '2024-09-10', verified: true }
      ],
      timeline: [
        { id: '1', date: '2024-09-01', time: '10:00 AM', event: 'Application Submitted', user: 'System' },
        { id: '2', date: '2024-09-05', time: '2:30 PM', event: 'Documents Uploaded', user: 'Parent' },
        { id: '3', date: '2024-09-10', time: '11:15 AM', event: 'Interview Scheduled', user: 'Admin' }
      ],
      notes_history: [
        { id: '1', date: '2024-09-12', author: 'Dr. Aris', content: 'Julian demonstrates an exceptional grasp of analytical concepts for his age.' }
      ]
    };

    const mockAssessment: InterviewAssessment = {
      academic_readiness: 4.0,
      cultural_fit: 5.0,
      notes: '"Julian demonstrates an exceptional grasp of analytical concepts for his age. He was highly articulate when discussing his passion for classical literature and robotics. During the group task, he showed natural leadership qualities while remaining inclusive of his peers. Strongly recommended for the Honors track."',
      last_updated: '2 hours ago',
      updated_by: 'Dr. Aris'
    };

    const mockDocuments: DocumentChecklistItem[] = [
      { id: '1', name: 'Birth Certificate', status: 'received' },
      { id: '2', name: 'Previous Grades', status: 'received' },
      { id: '3', name: 'Medical Records', status: 'pending' },
      { id: '4', name: 'Letter of Recommendation', status: 'received' }
    ];

    this.applicant.set(mockApplicant);
    this.interviewAssessment.set(mockAssessment);
    this.documents.set(mockDocuments);
    this.loading.set(false);
  }

  getStageStatus(stage: string): 'completed' | 'current' | 'upcoming' {
    const stages = ['inquiry', 'applied', 'interview', 'accepted', 'enrolled'];
    const currentStage = 'interview';
    const currentIndex = stages.indexOf(currentStage);
    const stageIndex = stages.indexOf(stage);

    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'current';
    return 'upcoming';
  }

  addNote() {
    if (this.newNote().trim()) {
      console.log('Adding note:', this.newNote());
      this.newNote.set('');
    }
  }

  attachRecording() {
    console.log('Attach recording');
  }

  moveToNextStage() {
    console.log('Move to next stage');
  }

  approveAdmission() {
    console.log('Approve admission');
  }

  rejectApplication() {
    console.log('Reject application');
  }
}
