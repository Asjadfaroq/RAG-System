using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
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
            var tenantIdClaim = user.FindFirst("tenantId")?.Value;
            if (!Guid.TryParse(tenantIdClaim, out var tenantId))
            {
                return Results.Unauthorized();
            }

            var overview = await overviewProvider.GetOverviewAsync(tenantId, ct);
            return Results.Ok(overview);
        });

        return routes;
    }
}
