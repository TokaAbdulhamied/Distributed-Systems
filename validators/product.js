

export const isImageSelected = (value, {req}) => {
    if (!req.file) {
        throw new Error('Please upload an image!')
    }
    return true;
}