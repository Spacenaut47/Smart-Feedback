using Azure.Storage.Blobs;

namespace SmartFeedbackAPI.Services
{
    public class BlobStorageService
    {
        private readonly string _connectionString;
        private readonly string _containerName = "feedback-images";

        public BlobStorageService(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("BlobStorage")!;
        }

        public async Task<string> UploadImageAsync(IFormFile file)
        {
            var blobServiceClient = new BlobServiceClient(_connectionString);
            var containerClient = blobServiceClient.GetBlobContainerClient(_containerName);
            await containerClient.CreateIfNotExistsAsync();

            var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
            var blobClient = containerClient.GetBlobClient(fileName);

            using var stream = file.OpenReadStream();
            await blobClient.UploadAsync(stream, overwrite: true);

            return blobClient.Uri.ToString(); // This is the image URL
        }
    }
}
