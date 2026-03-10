using System.Security.Claims;
using DocumentIntelligence.Application;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace DocumentIntelligence.Api;

public record CreateDocumentRequest(
    Guid WorkspaceId,
    string FileName,
    string StoragePath,
    string? Language);
public record UploadDocumentResponse(DocumentDto Document);

public static class DocumentEndpoints
{
    public static IEndpointRouteBuilder MapDocuments(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/documents")
            .RequireAuthorization("TenantUser");

        group.MapGet("/workspaces/{workspaceId:guid}", async (
            Guid workspaceId,
            ClaimsPrincipal user,
            IMediator mediator,
            IWorkspaceAccessService workspaceAccessService,
            CancellationToken ct) =>
        {
            var tenantId = user.GetTenantId();
            if (tenantId == null)
                return Results.Unauthorized();

            if (!await workspaceAccessService.WorkspaceBelongsToTenantAsync(workspaceId, tenantId.Value, ct))
            {
                return Results.Forbid();
            }

            var result = await mediator.Send(new GetDocumentsQuery(tenantId.Value, workspaceId), ct);
            return Results.Ok(result);
        });

        group.MapPost(string.Empty, async (
            CreateDocumentRequest request,
            ClaimsPrincipal user,
            IMediator mediator,
            IWorkspaceAccessService workspaceAccessService,
            CancellationToken ct) =>
        {
            var tenantId = user.GetTenantId();
            if (tenantId == null)
                return Results.Unauthorized();

            if (!await workspaceAccessService.WorkspaceBelongsToTenantAsync(request.WorkspaceId, tenantId.Value, ct))
            {
                return Results.Forbid();
            }

            var command = new CreateDocumentCommand(
                tenantId.Value,
                request.WorkspaceId,
                request.FileName,
                request.StoragePath,
                request.Language);

            var created = await mediator.Send(command, ct);
            return Results.Ok(created);
        });

        group.MapPost("/upload", async (
            string workspaceId,
            IFormFile file,
            string? language,
            ClaimsPrincipal user,
            IMediator mediator,
            IWorkspaceAccessService workspaceAccessService,
            IRateLimitService rateLimit,
            ILoggerFactory loggerFactory,
            CancellationToken ct) =>
        {
            var log = loggerFactory.CreateLogger("DocumentIntelligence.Documents");
            var tenantId = user.GetTenantId();
            var userId = user.GetUserId();
            if (tenantId == null)
                return Results.Unauthorized();

            var tid = tenantId.Value;
            var clientKey = userId != null ? $"{tid}:{userId}" : tid.ToString();
            if (!await rateLimit.AllowAsync("upload:minute", clientKey, 3, 60, ct))
            {
                log.LogWarning("Upload rate limited (per minute): Key={Key}", clientKey);
                return Results.Json(new { title = "Upload limit reached. You can upload 3 documents per minute.", status = 429 }, statusCode: 429);
            }
            if (!await rateLimit.AllowAsync("upload:hour", clientKey, 20, 3600, ct))
            {
                log.LogWarning("Upload rate limited (per hour): Key={Key}", clientKey);
                return Results.Json(new { title = "Upload limit reached. You can upload 20 documents per hour.", status = 429 }, statusCode: 429);
            }
            if (!await rateLimit.AllowAsync("upload:day", clientKey, 50, 86400, ct))
            {
                log.LogWarning("Upload rate limited (per day): Key={Key}", clientKey);
                return Results.Json(new { title = "Upload limit reached. You can upload 50 documents per day.", status = 429 }, statusCode: 429);
            }

            if (!Guid.TryParse(workspaceId, out var workspaceGuid))
            {
                return Results.BadRequest("workspaceId must be a valid GUID.");
            }

            if (!await workspaceAccessService.WorkspaceBelongsToTenantAsync(workspaceGuid, tenantId.Value, ct))
            {
                return Results.Forbid();
            }

            if (file == null || file.Length == 0)
            {
                return Results.BadRequest("File is required.");
            }

            var ext = Path.GetExtension(file.FileName).TrimStart('.');
            if (string.IsNullOrEmpty(ext) || !ext.Equals("pdf", StringComparison.OrdinalIgnoreCase))
            {
                return Results.BadRequest("Only PDF documents are supported. Please upload a PDF file.");
            }

            await using var stream = file.OpenReadStream();

            var command = new UploadDocumentCommand(
                tenantId.Value,
                workspaceGuid,
                file.FileName,
                stream,
                language);

            try
            {
                var document = await mediator.Send(command, ct);
                log.LogInformation(
                    "Document uploaded and enqueued: DocumentId={DocumentId}, WorkspaceId={WorkspaceId}, FileName={FileName}, TenantId={TenantId}",
                    document.Id, workspaceGuid, file.FileName, tenantId.Value);
                return Results.Ok(new UploadDocumentResponse(document));
            }
            catch (Exception ex)
            {
                log.LogError(ex, "Document upload failed: FileName={FileName}, WorkspaceId={WorkspaceId}", file.FileName, workspaceGuid);
                throw;
            }
        })
        .DisableAntiforgery()
        .Accepts<IFormFile>("multipart/form-data");

        group.MapDelete("/{documentId:guid}", async (
            Guid documentId,
            ClaimsPrincipal user,
            IDocumentDeleteService deleteService,
            CancellationToken ct) =>
        {
            var tenantId = user.GetTenantId();
            if (tenantId == null)
                return Results.Unauthorized();

            try
            {
                await deleteService.DeleteDocumentAsync(documentId, tenantId.Value, ct);
                return Results.NoContent();
            }
            catch (InvalidOperationException)
            {
                return Results.NotFound(new { error = "Document not found or access denied." });
            }
        });

        return routes;
    }
}

