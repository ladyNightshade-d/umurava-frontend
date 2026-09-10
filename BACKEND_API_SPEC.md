# Backend API Specification

This document specifies all the endpoints your custom backend needs to implement for the HireWise application to work.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

---

## 1. Authentication Endpoints

### POST /auth/register
Register a new user (recruiter or candidate)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "recruiter" | "candidate",  // Optional, defaults to "recruiter"
  "company": "Acme Inc"  // Optional, for recruiters only
}
```

**Response (201):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "recruiter"
  }
}
```

### POST /auth/login
Login existing user

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "recruiter"
  }
}
```

---

## 2. Recruiter - Job Management

### GET /jobs
List all jobs for authenticated recruiter

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "_id": "job_uuid",
    "id": "job_uuid",
    "title": "Senior Software Engineer",
    "department": "Engineering",
    "description": "We are looking for...",
    "skills": ["React", "Node.js", "TypeScript"],
    "experience": "5+ years",
    "education": "Bachelor's degree",
    "createdBy": "user_uuid",
    "createdAt": "2026-04-25T..."
  }
]
```

### POST /jobs
Create a new job

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Senior Software Engineer",
  "department": "Engineering",
  "description": "We are looking for...",
  "required_skills": ["React", "Node.js"],
  "experience_level": "5+ years",
  "top_performer_profile": "Self-starter, team player...",
  "weight_skills": 40,
  "weight_experience": 30,
  "weight_culture": 30
}
```

**Response (201):**
```json
{
  "_id": "job_uuid",
  "id": "job_uuid",
  "title": "Senior Software Engineer",
  ...
}
```

### DELETE /jobs/:jobId
Delete a job

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Job deleted successfully"
}
```

---

## 3. Recruiter - Candidate Management

### GET /jobs/:jobId/applicants
List all candidates/applicants for a job

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "data": [
    {
      "_id": "candidate_uuid",
      "id": "candidate_uuid",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "skills": ["React", "JavaScript"],
      "experience": "3 years",
      "education": "Bachelor's",
      "resumeUrl": "https://...",
      "jobId": "job_uuid",
      "score": 0,
      "rank": 0,
      "status": "pending",
      "createdAt": "2026-04-25T..."
    }
  ]
}
```

### POST /jobs/:jobId/applicants
Add a candidate manually

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "resume_text": "Experienced developer...",
  "skills": ["React", "Node.js"]
}
```

**Response (201):**
```json
{
  "_id": "candidate_uuid",
  "name": "Jane Smith",
  ...
}
```

### POST /jobs/:jobId/applicants/upload-csv
Bulk upload candidates via CSV

**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

**Request Body:** FormData with `file` field

**Response (200):**
```json
{
  "message": "5 candidates uploaded successfully",
  "count": 5
}
```

---

## 4. Recruiter - AI Screening

### GET /jobs/:jobId/applicants/shortlist
Get screening results for a job

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "_id": "result_uuid",
    "id": "result_uuid",
    "candidate_id": "candidate_uuid",
    "job_id": "job_uuid",
    "final_score": 85,
    "strengths": ["Strong React skills", "Good communication"],
    "gaps": ["Limited backend experience"],
    "culture_fit": "High",
    "skill_tags": ["React", "Frontend"],
    "interview_questions": ["Tell me about your React experience"],
    "recommendation": "Strong candidate, recommend interview",
    "candidate": {
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  }
]
```

### POST /jobs/:jobId/applicants/screen
Run AI screening on candidates

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "candidateIds": ["candidate_uuid_1", "candidate_uuid_2"]
}
```

**Response (200):**
```json
{
  "message": "Screening completed",
  "results": [...]
}
```

---

## 5. Candidate - Profile Management

### GET /candidates/profile
Get candidate profile

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "user_uuid",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "company": "Current Employer Inc",
  "created_at": "2026-04-25T..."
}
```

### PUT /candidates/profile
Update candidate profile

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "company": "New Company Inc"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully"
}
```

---

## 6. Candidate - Job Applications

### GET /jobs/public
List all public jobs (for candidates to browse)

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "job_uuid",
    "_id": "job_uuid",
    "title": "Senior Software Engineer",
    "department": "Engineering",
    "description": "We are looking for...",
    "required_skills": ["React", "Node.js"],
    "experience_level": "5+ years",
    "created_at": "2026-04-25T..."
  }
]
```

### GET /candidates/applications
List all applications for authenticated candidate

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "application_uuid",
    "_id": "application_uuid",
    "user_id": "user_uuid",
    "job_id": "job_uuid",
    "resume_text": "Experienced developer...",
    "skills": ["React", "Node.js"],
    "status": "pending",
    "created_at": "2026-04-25T...",
    "job": {
      "title": "Senior Software Engineer",
      "department": "Engineering",
      "experience_level": "5+ years"
    }
  }
]
```

### POST /candidates/applications
Submit a new job application

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "job_id": "job_uuid",
  "resume_text": "I am an experienced developer with...",
  "skills": ["React", "TypeScript", "Node.js"]
}
```

**Response (201):**
```json
{
  "id": "application_uuid",
  "message": "Application submitted successfully"
}
```

---

## 7. Candidate - AI Feedback

### GET /candidates/feedback
Get all AI feedback for authenticated candidate

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "feedback_uuid",
    "_id": "feedback_uuid",
    "application_id": "application_uuid",
    "job_id": "job_uuid",
    "user_id": "user_uuid",
    "final_score": 75,
    "strengths": ["Strong technical skills", "Good communication"],
    "gaps": ["Limited leadership experience", "No cloud experience"],
    "culture_fit": "Medium",
    "status_reason": "Good technical fit but needs more experience",
    "improvement_tips": [
      "Gain experience with AWS or Azure",
      "Take on team lead responsibilities"
    ],
    "created_at": "2026-04-25T...",
    "job": {
      "title": "Senior Software Engineer",
      "department": "Engineering"
    }
  }
]
```

### POST /candidates/feedback/generate
Request AI feedback generation for an application

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "application_id": "application_uuid",
  "job_id": "job_uuid"
}
```

**Response (200):**
```json
{
  "message": "Feedback generated successfully",
  "feedback": {
    "id": "feedback_uuid",
    "final_score": 75,
    ...
  }
}
```

---

## Error Responses

All endpoints should return appropriate error responses:

**400 Bad Request:**
```json
{
  "message": "Invalid request data",
  "errors": ["Email is required", "Password must be at least 6 characters"]
}
```

**401 Unauthorized:**
```json
{
  "message": "Invalid or expired token"
}
```

**403 Forbidden:**
```json
{
  "message": "You don't have permission to access this resource"
}
```

**404 Not Found:**
```json
{
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "message": "An error occurred while processing your request"
}
```

---

## Notes

1. **JWT Token:** Should include `user_id` and `role` in the payload
2. **CORS:** Enable CORS for `http://localhost:3000` (Next.js dev server)
3. **Validation:** Validate all inputs before processing
4. **Security:** Hash passwords with bcrypt, validate JWT tokens
5. **Database:** Use MongoDB, PostgreSQL, or any database of your choice
6. **AI Integration:** Integrate with OpenAI, Anthropic, or your preferred AI service for screening and feedback generation
