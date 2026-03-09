using System.Security.Claims;
using DocumentIntelligence.Application;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace DocumentIntelligence.Api;

public record CreateWorkspaceRequest(string Name, string? Description);

public static class WorkspaceEndpoints
{
    public static IEndpointRouteBuilder MapWorkspaces(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/workspaces")
            .RequireAuthorization("TenantUser");

        group.MapGet(string.Empty, async (ClaimsPrincipal user, IMediator mediator, CancellationToken ct) =>
        {
            var tenantId = user.GetTenantId();
            if (tenantId == null)
                return Results.Unauthorized();

            var result = await mediator.Send(new GetWorkspacesQuery(tenantId.Value), ct);
            return Results.Ok(result);
        });

        group.MapPost(string.Empty, async (CreateWorkspaceRequest request, ClaimsPrincipal user, IMediator mediator, CancellationToken ct) =>
        {
            var tenantId = user.GetTenantId();
            if (tenantId == null)
                return Results.Unauthorized();

            var command = new CreateWorkspaceCommand(tenantId.Value, request.Name, request.Description);
            var created = await mediator.Send(command, ct);
            return Results.Ok(created);
        })
        .RequireAuthorization("OwnerOrAdmin");

        group.MapDelete("/{workspaceId:guid}", async (
            Guid workspaceId,
            ClaimsPrincipal user,
            IWorkspaceDeleteService deleteService,
            bool confirm,
            CancellationToken ct) =>
        {
            if (user.GetRole() != "Owner") return Results.Forbid();
            var tenantId = user.GetTenantId();
            if (tenantId == null) return Results.Unauthorized();
            if (!confirm) return Results.BadRequest(new { error = "Confirmation required. Set confirm=true to proceed." });
            try
            {
                await deleteService.DeleteWorkspaceAsync(workspaceId, tenantId.Value, ct);
                return Results.NoContent();
            }
            catch (InvalidOperationException ex) { return Results.NotFound(new { error = ex.Message }); }
        })
        .RequireAuthorization("OwnerOnly");

        return routes;
    }
}

