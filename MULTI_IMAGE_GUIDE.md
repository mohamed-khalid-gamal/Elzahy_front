# Multi-Image Support Implementation Guide

This document explains the changes made to support multiple images for projects and single image support for awards in the Angular frontend.

## Updated Type Definitions

### ProjectImageDto
```typescript
export interface ProjectImageDto {
  id: string;
  imageData: string; // Base64 encoded image data
  contentType: string; // MIME type like "image/jpeg"
  fileName: string; // Original filename
  description?: string;
  isMainImage: boolean;
  sortOrder: number;
}
```

### Updated ProjectDto
```typescript
export interface ProjectDto {
  // ... existing properties
  images: ProjectImageDto[]; // New: Multiple images support
  mainImage?: ProjectImageDto; // New: Quick access to main image
  // Legacy properties still supported for backward compatibility
  imageData?: string; 
  imageContentType?: string;
  photoUrl?: string;
}
```

### Updated AwardDto
```typescript
export interface AwardDto {
  // ... existing properties
  imageData?: string; // Base64 encoded image data
  imageContentType?: string; // MIME type
  imageFileName?: string; // Original filename
  imageUrl?: string; // Legacy support
}
```

## New Components

### ImageGalleryComponent
A reusable component for displaying multiple project images with thumbnail navigation.

**Usage:**
```html
<app-image-gallery 
  [images]="project.images" 
  [showThumbnails]="true">
</app-image-gallery>
```

**Features:**
- Main image display with thumbnail navigation
- Automatic main image selection
- Image descriptions and metadata
- Responsive design
- Image counter

## Updated Services

### ProjectsService - New Methods

```typescript
// Get specific project image by image ID
getProjectImageById(imageId: string): Observable<Blob>

// Get specific project image URL by image ID
getProjectImageUrlById(imageId: string): string

// Add single image to existing project
addProjectImage(projectId: string, imageData: AddProjectImageRequestDto): Observable<ProjectImageDto>

// Delete specific project image
deleteProjectImage(imageId: string): Observable<void>

// Set main image for a project
setProjectMainImage(projectId: string, imageId: string): Observable<void>

// Create project with multiple images
createProjectWithFormData(projectData: CreateProjectFormRequestDto): Observable<ProjectDto>

// Update project with image management
updateProjectWithFormData(id: string, projectData: UpdateProjectFormRequestDto): Observable<ProjectDto>
```

### AwardsService - New Methods

```typescript
// Get award image as blob
getAwardImage(id: string): Observable<Blob>

// Get award image URL
getAwardImageUrl(id: string): string

// Create award with image upload
createAwardWithFormData(awardData: CreateAwardFormRequestDto): Observable<Award>

// Update award with image management
updateAwardWithFormData(id: string, awardData: UpdateAwardFormRequestDto): Observable<Award>
```

## Updated Components

### ProjectsSectionComponent

**New Methods:**
```typescript
// Get project image URL (supports new multi-image structure)
getProjectImageUrl(project: ProjectDto): string

// Get all images for a project
getProjectImages(project: ProjectDto): { url: string; alt: string; isMain: boolean }[]

// Check if project has multiple images
hasMultipleImages(project: ProjectDto): boolean

// Get image count for a project
getImageCount(project: ProjectDto): number
```

**UI Updates:**
- Image count badge for projects with multiple images
- Enhanced image handling with fallback support
- Better error handling for missing images

### AwardsSectionComponent

**New Methods:**
```typescript
// Get award image URL (supports new binary image structure)
getAwardImageUrl(award: AwardDto): string

// Check if award has an image
hasImage(award: AwardDto): boolean

// Format award date for display
formatAwardDate(dateReceived: string): string
```

**UI Updates:**
- Support for binary image data display
- Fallback to placeholder when no image available
- Loading and error states
- Real data integration with awards service

### ProjectDetailsPageComponent

**Enhanced Features:**
- Full image gallery integration
- Multiple image support in hero section
- Image count display
- Backward compatibility with legacy single images

## Form Data Structure

### Creating Project with Multiple Images
```typescript
const formData = new FormData();
formData.append('name', 'Project Name');
formData.append('description', 'Project Description');
formData.append('status', 'Current');

// Multiple images
images.forEach(image => {
  formData.append('images', image);
});

// Specify main image (index)
formData.append('mainImageIndex', '0');
```

### Creating Award with Image
```typescript
const formData = new FormData();
formData.append('name', 'Award Name');
formData.append('givenBy', 'Organization');
formData.append('dateReceived', '2024-01-01');
formData.append('image', imageFile);
```

## API Endpoints Used

### Project Endpoints
- `GET /api/projects` - Get all projects with images
- `GET /api/projects/{id}` - Get project with all images
- `POST /api/projects` - Create project with multiple images
- `PUT /api/projects/{id}` - Update project and manage images
- `GET /api/projects/images/{imageId}` - Download specific image
- `POST /api/projects/{id}/images` - Add image to project
- `DELETE /api/projects/images/{imageId}` - Remove image
- `PUT /api/projects/{projectId}/images/{imageId}/set-main` - Set main image

### Award Endpoints
- `GET /api/awards` - Get all awards
- `POST /api/awards` - Create award with image
- `PUT /api/awards/{id}` - Update award with image
- `GET /api/awards/{id}/image` - Download award image

## Migration Notes

### Backward Compatibility
- Legacy `imageData`, `imageContentType`, and `photoUrl` properties are still supported
- Components automatically fall back to legacy properties when new image arrays are empty
- Existing projects will continue to work without changes

### Image Display Priority
1. **New Structure**: `project.mainImage` or first image in `project.images[]`
2. **Legacy Structure**: `project.imageData` with `project.imageContentType`
3. **Legacy URL**: `project.photoUrl`
4. **Fallback**: Placeholder image

## Example Usage

### Display Project with Images
```html
<div *ngFor="let project of projects" class="project-card">
  <!-- Simple image display -->
  <img [src]="getProjectImageUrl(project)" [alt]="project.name">
  
  <!-- Image count badge -->
  <span *ngIf="hasMultipleImages(project)" class="image-count">
    {{ getImageCount(project) }} images
  </span>
  
  <!-- Full gallery (for details page) -->
  <app-image-gallery 
    *ngIf="project.images && project.images.length > 1"
    [images]="project.images">
  </app-image-gallery>
</div>
```

### Display Award with Image
```html
<div *ngFor="let award of awards" class="award-card">
  <img 
    *ngIf="hasImage(award)"
    [src]="getAwardImageUrl(award)" 
    [alt]="award.name">
  
  <div class="award-info">
    <h3>{{ award.name }}</h3>
    <p>{{ award.givenBy }} - {{ formatAwardDate(award.dateReceived) }}</p>
  </div>
</div>
```

## Benefits

1. **Enhanced Visual Experience**: Projects can showcase multiple angles and aspects
2. **Better Organization**: Main image designation for consistent display
3. **Flexible Management**: Individual image operations without affecting others
4. **Backward Compatibility**: Existing projects continue to work seamlessly
5. **Consistent API**: Both projects and awards use similar patterns for image handling
6. **Performance**: Images are loaded efficiently with proper error handling
7. **Responsive Design**: Image galleries work well on all device sizes

## Next Steps

To fully utilize the multi-image functionality:

1. **Admin Interface**: Create forms for uploading and managing multiple images
2. **Image Optimization**: Implement client-side image compression before upload
3. **Lazy Loading**: Add intersection observer for performance optimization
4. **Full-Screen Gallery**: Implement modal gallery for detailed image viewing
5. **Drag & Drop**: Add drag-and-drop interface for image reordering
6. **Bulk Operations**: Support for bulk image upload and management
