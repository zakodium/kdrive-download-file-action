# kdrive-download-file-action

Download a file from kDrive using a public sharing link.

## Inputs

### `link`

**Required** The public sharing link of the file.

### `fileId`

**Required** The ID of the file in the drive.

### `destination`

**Required** The destination path to save the file.

### `password`

The password of the link, if any.

## Example

```yaml
jobs:
  my-job:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: zakodium/kdrive-download-file-action
        with:
          link: ${{ secrets.KDRIVE_SHARE_LINK }}
          fileId: ${{ secrets.KDRIVE_SHARE_FILE_ID }}
          destination: 'my/file.txt'
          password: ${{ secrets.KDRIVE_SHARE_PASSWORD }}
```
