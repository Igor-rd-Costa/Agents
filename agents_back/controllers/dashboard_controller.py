from typing import Optional
from agents_back.services.dashboard_service import DashboardService, get_dashboard_service
from fastapi import APIRouter, Depends, Request
from fastapi.params import Query
from agents_back.services.auth_service import AuthService, get_auth_service
from agents_back.types.dashboard import DeleteDashboardDTO, CreateDashboardDTO
from agents_back.types.general import ObjectId

router = APIRouter(prefix="/dashboard")

@router.get("")
async def get_dashboards(
        request: Request,
        chat_id: Optional[ObjectId] = Query(None),
        auth_service: AuthService = Depends(get_auth_service),
        dashboard_service: DashboardService = Depends(get_dashboard_service)
):
    user = await auth_service.get_current_user(request)
    dashboards = await dashboard_service.get_dashboards(user.id) if chat_id is None else await dashboard_service.get_dashboard(chat_id, user.id)
    return dashboards


@router.post("")
async def create_dashboard(
        request: Request,
        dashboard: CreateDashboardDTO,
        auth_service: AuthService = Depends(get_auth_service),
        dashboard_service: DashboardService = Depends(get_dashboard_service)
):
    user = await auth_service.get_current_user(request)
    result = await dashboard_service.create_dashboard(user.id, dashboard.name)
    return result


@router.delete("")
async def delete_dashboard(
        dto: DeleteDashboardDTO,
        request: Request,
        auth_service: AuthService = Depends(get_auth_service),
        dashboard_service: DashboardService = Depends(get_dashboard_service)
):
    user = await auth_service.get_current_user(request)
    return await dashboard_service.delete_dashboard(dto.id, user.id)


@router.get("/{dashboard_id}/messages")
async def get_messages(
        request: Request,
        dashboard_id: ObjectId,
        auth_service: AuthService = Depends(get_auth_service),
        dashboard_service: DashboardService = Depends(get_dashboard_service)
):
    user = await auth_service.get_current_user(request)
    messages = await dashboard_service.get_messages(dashboard_id)
    return messages