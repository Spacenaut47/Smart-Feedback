# Use ASP.NET base image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy and restore the .csproj
COPY ./SmartFeedbackAPI.csproj ./SmartFeedbackAPI.csproj
RUN dotnet restore ./SmartFeedbackAPI.csproj

# Copy the rest of the code
COPY . .
RUN dotnet publish SmartFeedbackAPI.csproj -c Release -o /app/publish

# Final stage
FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "SmartFeedbackAPI.dll"]
