"""Background job management."""

import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Any


class JobStatus(str, Enum):
    """Job status."""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


_jobs: dict[str, dict] = {}


def create_job(job_type: str) -> str:
    """Create a new job, return job_id."""
    job_id = str(uuid.uuid4())
    _jobs[job_id] = {
        "id": job_id,
        "type": job_type,
        "status": JobStatus.PENDING,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "progress": 0,
        "eta_seconds": None,
        "result": None,
        "error": None,
    }
    return job_id


def get_job(job_id: str) -> dict | None:
    """Get job by id."""
    return _jobs.get(job_id)


def update_job(
    job_id: str,
    status: JobStatus | None = None,
    progress: int | None = None,
    eta_seconds: int | None = None,
    result: Any = None,
    error: str | None = None,
):
    """Update job fields."""
    if job_id not in _jobs:
        return
    j = _jobs[job_id]
    if status is not None:
        j["status"] = status
    if progress is not None:
        j["progress"] = progress
    if eta_seconds is not None:
        j["eta_seconds"] = eta_seconds
    if result is not None:
        j["result"] = result
    if error is not None:
        j["error"] = error


def set_job_result(job_id: str, result: Any, status: JobStatus = JobStatus.COMPLETED):
    """Set job result and mark completed."""
    update_job(job_id, status=status, result=result, progress=100)


def set_job_failed(job_id: str, error: str):
    """Mark job as failed."""
    update_job(job_id, status=JobStatus.FAILED, error=error)
