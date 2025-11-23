<?php
// Nama file ZIP yang mau di-unzip
$zipFile = 'gele.zip';

// Folder tujuan extract
$extractTo = 'extracted';

// Buat folder tujuan kalau belum ada
if (!is_dir($extractTo)) {
    mkdir($extractTo, 0777, true);
}

$zip = new ZipArchive;
if ($zip->open($zipFile) === TRUE) {
    $zip->extractTo($extractTo);
    $zip->close();
    echo "Unzip berhasil ke folder: $extractTo";
} else {
    echo "Gagal membuka ZIP.";
}
?>
