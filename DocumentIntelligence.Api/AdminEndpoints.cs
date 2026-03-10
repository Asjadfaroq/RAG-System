using System.Security.Claims;
using DocumentIntelligence.Application;
using Microsoft.AspNetCore.Authorization;

namespace DocumentIntelligence.Api;

public static class AdminEndpoints
{
    public static IEndpointRouteBuilder MapAdmin(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/admin")
            .RequireAuthorization("OwnerOrAdmin");

        group.MapGet("/tenant/overview", async (
            ClaimsPrincipal user,
            ITenantOverviewProvider overviewProvider,
            CancellationToken ct) =>
        {
            var tenantId = user.GetTenantId();
            if (tenantId == null)
                return Results.Unauthorized();

            var overview = await overviewProvider.GetOverviewAsync(tenantId.Value, ct);
            return Results.Ok(overview);
        });

        group.MapDelete("/tenant", async (
            ClaimsPrincipal user,
            ITenantDeleteService deleteService,
            bool confirm,
            CancellationToken ct) =>
        {
            if (user.GetRole() != "Owner") return Results.Forbid();
            var tenantId = user.GetTenantId();
            if (tenantId == null) return Results.Unauthorized();
            if (!confirm) return Results.BadRequest(new { error = "Confirmation required. Set confirm=true to proceed." });
            try
            {
                await deleteService.DeleteTenantAsync(tenantId.Value, ct);
                return Results.NoContent();
            }
            catch (InvalidOperationException) { return Results.BadRequest(new { error = "Tenant deletion failed." }); }
        })
        .RequireAuthorization("OwnerOnly");

        return routes;
    }
}
