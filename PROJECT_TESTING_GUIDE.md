# Project Form Testing Guide

## How to Test the Enhanced Project Management Features

### 1. Creating a New Project
1. Navigate to **Admin > Projects**
2. Click the **"Add Project"** button
3. Fill in required fields:
   - **Project Name**: Enter a test project name
   - **Description**: Add a meaningful description
   - **Status**: Select Current/Future/Past
4. **Upload Images** (REQUIRED):
   - Select one or more images
   - Verify images are compressed and previewed
   - Check "Total images" counter
5. Fill other optional fields as needed
6. Click **"Create"** - should only work with at least 1 image

### 2. Editing an Existing Project
1. Click **"Edit"** button on any project
2. Verify:
   - ✅ All existing data loads correctly in form fields
   - ✅ **Status field** shows correct current status
   - ✅ **Existing images** appear in "Current Images" section
   - ✅ Each image has **"Main"** and **"✕"** buttons on hover

### 3. Managing Images During Edit
1. **Delete existing images**:
   - Hover over any image
   - Click **"✕"** button (disabled if only 1 image remains)
   - Verify image is removed from grid
2. **Set main image**:
   - Hover over any non-main image
   - Click **"Main"** button
   - Verify blue border appears on selected image
3. **Add new images**:
   - Select new files using file input
   - Verify they appear in "New Images to Upload" section
   - Check green borders on new images
4. **Clear new images**:
   - Click **"Clear All"** button in new images section

### 4. Validation Testing
1. **Try to submit without images**:
   - Remove all existing images
   - Don't add new images
   - Submit button should be disabled
   - Warning message should appear
2. **Try to edit with only one image**:
   - Ensure delete button is disabled on the last image
3. **Status loading**:
   - Edit projects with different statuses
   - Verify correct status is selected in dropdown

### 5. Success Indicators
- **✅ Data Loading**: All project fields populate correctly
- **✅ Status Field**: Shows correct current status
- **✅ Image Management**: Can add/remove/set main images
- **✅ Validation**: Minimum 1 image requirement enforced
- **✅ Visual Feedback**: Clear distinction between existing/new images
- **✅ Error Handling**: Appropriate messages for validation failures

### 6. Expected Behavior
- **Creating**: Must have at least 1 image to proceed
- **Editing**: Can manage existing images + add new ones
- **Status**: Correctly converts between string/number formats
- **Images**: Shows existing (gray/blue borders) vs new (green borders)
- **Main Image**: Blue border and "Main" badge indicate primary image
- **Delete Protection**: Cannot delete last remaining image

### 7. API Integration
- **Create**: Uses `CreateProjectFormRequestDto` with images array
- **Update**: Uses `UpdateProjectFormRequestDto` with:
  - `newImages`: New files to upload
  - `removeImageIds`: Images to delete
  - `mainImageId`: Primary image selection

## Troubleshooting
- If images don't load, check browser console for API errors
- If status doesn't show correctly, check project data format
- If validation fails, ensure at least 1 image is present
- If form doesn't populate, check edit method implementation
