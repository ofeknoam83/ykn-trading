"""Jobs API - poll background job status."""

from fastapi import APIRouter, HTTPException

from app.core.jobs import get_job

router = APIRouter()


@router.get("/{job_id}")
async def get_job_status(job_id: str):
    """Get job status, progress, result."""
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
