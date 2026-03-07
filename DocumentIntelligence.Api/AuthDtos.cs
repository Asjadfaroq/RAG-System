using DocumentIntelligence.Application;
using MediatR;

namespace DocumentIntelligence.Api;

public record RegisterTenantRequest(
    string TenantName,
    string TenantSlug,
    string OwnerEmail,
    string OwnerPassword);

public record LoginRequest(
    string TenantSlug,
    string Email,
    string Password);

public record RefreshRequest(string RefreshToken);

public static class AuthEndpoints
{
    private const string LogCategory = "DocumentIntelligence.Auth";

    public static IEndpointRouteBuilder MapAuth(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/auth");

        group.MapPost("/register-tenant", async (
            RegisterTenantRequest request,
            IMediator mediator,
            ILoggerFactory loggerFactory,
            CancellationToken ct) =>
        {
            var log = loggerFactory.CreateLogger(LogCategory);
            try
            {
                var command = new RegisterTenantAndOwnerCommand(
                    request.TenantName,
                    request.TenantSlug,
                    request.OwnerEmail,
                    request.OwnerPassword);
                var result = await mediator.Send(command, ct);
                log.LogInformation(
                    "Tenant registered: TenantSlug={TenantSlug}, OwnerEmail={OwnerEmail}, TenantId={TenantId}",
                    request.TenantSlug, request.OwnerEmail, result.TenantId);
                return Results.Ok(result);
            }
            catch (Exception ex)
            {
                log.LogWarning(ex, "Tenant registration failed: TenantSlug={TenantSlug}, Email={Email}", request.TenantSlug, request.OwnerEmail);
                throw;
            }
        });

        group.MapPost("/login", async (
            LoginRequest request,
            IMediator mediator,
            ILoggerFactory loggerFactory,
            CancellationToken ct) =>
        {
            var log = loggerFactory.CreateLogger(LogCategory);
            try
            {
                var command = new LoginCommand(request.Email, request.Password, request.TenantSlug);
                var result = await mediator.Send(command, ct);
                log.LogInformation(
                    "Login success: TenantSlug={TenantSlug}, Email={Email}, TenantId={TenantId}, Role={Role}",
                    request.TenantSlug, request.Email, result.TenantId, result.Role);
                return Results.Ok(result);
            }
            catch (UnauthorizedAccessException)
            {
                log.LogWarning("Login failed (unauthorized): TenantSlug={TenantSlug}, Email={Email}", request.TenantSlug, request.Email);
                return Results.Unauthorized();
            }
        });

        group.MapPost("/refresh", async (
            RefreshRequest request,
            IMediator mediator,
            ILoggerFactory loggerFactory,
            CancellationToken ct) =>
        {
            var log = loggerFactory.CreateLogger(LogCategory);
            if (string.IsNullOrWhiteSpace(request.RefreshToken))
            {
                log.LogWarning("Refresh called without token");
                return Results.BadRequest("RefreshToken is required.");
            }
            try
            {
                var result = await mediator.Send(new RefreshCommand(request.RefreshToken.Trim()), ct);
                log.LogInformation("Refresh success: TenantId={TenantId}, Email={Email}", result.TenantId, result.Email);
                return Results.Ok(result);
            }
            catch (UnauthorizedAccessException)
            {
                log.LogWarning("Refresh failed (invalid or expired token)");
                return Results.Unauthorized();
            }
        });

        return routes;
    }
}

