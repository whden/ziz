let currentBarcode = null;

const barcodeValue = document.getElementById('barcode-value');
const barcodeFormat = document.getElementById('barcode-format');
const barcodeCaption = document.getElementById('barcode-caption');

const barWidthSlider = document.getElementById('bar-width');
const heightSlider = document.getElementById('height');
const marginSlider = document.getElementById('margin');
const fontSizeSlider = document.getElementById('font-size');
const textMarginSlider = document.getElementById('text-margin');

const barWidthValue = document.getElementById('bar-width-value');
const heightValue = document.getElementById('height-value');
const marginValue = document.getElementById('margin-value');
const fontSizeValue = document.getElementById('font-size-value');
const textMarginValue = document.getElementById('text-margin-value');

const backgroundColorInput = document.getElementById('background-color');
const backgroundColorPicker = document.getElementById('background-color-picker');
const lineColorInput = document.getElementById('line-color');
const lineColorPicker = document.getElementById('line-color-picker');

const saveBtn = document.getElementById('save-btn');
const printBtn = document.getElementById('print-btn');
const copyBtn = document.getElementById('copy-btn');

const toast = document.getElementById('toast');

function generateBarcode() {
    const value = barcodeValue.value || '1234567890';
    const format = barcodeFormat.value;
    
    const options = {
        format: format,
        width: parseFloat(barWidthSlider.value),
        height: parseInt(heightSlider.value),
        margin: parseInt(marginSlider.value),
        fontSize: parseInt(fontSizeSlider.value),
        textMargin: parseInt(textMarginSlider.value),
        background: backgroundColorInput.value,
        lineColor: lineColorInput.value,
        displayValue: true,
        font: 'Roboto',
        fontOptions: 'bold',
        textAlign: 'center',
        textPosition: 'bottom',
        valid: function(valid) {
            if (!valid) {
                showToast('유효하지 않은 바코드 값입니다.');
            }
        }
    };
    
    try {
        JsBarcode('#barcode', value, options);
        barcodeCaption.textContent = value;
        currentBarcode = value;
    } catch (error) {
        showToast('바코드 생성 중 오류가 발생했습니다.');
        console.error('Barcode generation error:', error);
    }
}

function updateSliderValue(slider, valueElement) {
    valueElement.textContent = slider.value;
}

barWidthSlider.addEventListener('input', () => {
    updateSliderValue(barWidthSlider, barWidthValue);
    generateBarcode();
});

heightSlider.addEventListener('input', () => {
    updateSliderValue(heightSlider, heightValue);
    generateBarcode();
});

marginSlider.addEventListener('input', () => {
    updateSliderValue(marginSlider, marginValue);
    generateBarcode();
});

fontSizeSlider.addEventListener('input', () => {
    updateSliderValue(fontSizeSlider, fontSizeValue);
    generateBarcode();
});

textMarginSlider.addEventListener('input', () => {
    updateSliderValue(textMarginSlider, textMarginValue);
    generateBarcode();
});

function syncColorInputs(textInput, colorPicker) {
    textInput.addEventListener('input', () => {
        const color = textInput.value;
        if (/^#[0-9A-F]{6}$/i.test(color)) {
            colorPicker.value = color;
            generateBarcode();
        }
    });
    
    colorPicker.addEventListener('input', () => {
        textInput.value = colorPicker.value.toUpperCase();
        generateBarcode();
    });
}

syncColorInputs(backgroundColorInput, backgroundColorPicker);
syncColorInputs(lineColorInput, lineColorPicker);

barcodeValue.addEventListener('input', generateBarcode);
barcodeFormat.addEventListener('change', generateBarcode);

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function saveBarcodeAsImage() {
    const svg = document.getElementById('barcode');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.fillStyle = backgroundColorInput.value;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `barcode_${currentBarcode || 'image'}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('바코드가 저장되었습니다.');
        });
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}

saveBtn.addEventListener('click', saveBarcodeAsImage);

printBtn.addEventListener('click', () => {
    window.print();
    showToast('인쇄 대화상자가 열렸습니다.');
});

async function copyBarcodeToClipboard() {
    try {
        const svg = document.getElementById('barcode');
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        });
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.fillStyle = backgroundColorInput.value;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(async (blob) => {
            try {
                if (navigator.clipboard && window.ClipboardItem) {
                    const items = {
                        'image/png': blob,
                        'text/plain': new Blob([currentBarcode || ''], { type: 'text/plain' })
                    };
                    
                    await navigator.clipboard.write([
                        new ClipboardItem(items)
                    ]);
                    showToast('바코드 이미지와 텍스트가 복사되었습니다.');
                } else {
                    await navigator.clipboard.writeText(currentBarcode || '');
                    showToast('바코드 텍스트가 복사되었습니다.');
                }
            } catch (err) {
                console.error('Clipboard error:', err);
                try {
                    await navigator.clipboard.writeText(currentBarcode || '');
                    showToast('바코드 텍스트가 복사되었습니다.');
                } catch (textErr) {
                    showToast('복사 기능이 지원되지 않습니다.');
                }
            }
        });
    } catch (error) {
        console.error('Copy error:', error);
        showToast('복사 중 오류가 발생했습니다.');
    }
}

copyBtn.addEventListener('click', copyBarcodeToClipboard);

document.addEventListener('DOMContentLoaded', () => {
    generateBarcode();
});