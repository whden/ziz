let currentBarcode = null;
let isAutoMode = localStorage.getItem('barcodeAutoMode') === 'true';

const barcodeValue = document.getElementById('barcode-value');
const barcodeFormat = document.getElementById('barcode-format');
const barcodeCaption = document.getElementById('barcode-caption');
const autoBtn = document.getElementById('auto-btn');

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
        displayValue: false,
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
        // 임시 canvas에 바코드 생성
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, value, options);
        
        // canvas를 PNG base64로 변환하여 img src에 설정
        const barcodeImg = document.getElementById('barcode');
        barcodeImg.src = canvas.toDataURL('image/png');
        
        barcodeCaption.textContent = value;
        barcodeCaption.removeAttribute('title');
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
    const barcodeImg = document.getElementById('barcode');
    
    // img의 src에서 base64 데이터를 직접 사용
    const a = document.createElement('a');
    a.href = barcodeImg.src;
    a.download = `barcode_${currentBarcode || 'image'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('바코드가 저장되었습니다.');
}

saveBtn.addEventListener('click', saveBarcodeAsImage);

printBtn.addEventListener('click', () => {
    window.print();
    showToast('인쇄 대화상자가 열렸습니다.');
});

async function copyBarcodeToClipboard() {
    try {
        const barcodeImg = document.getElementById('barcode');
        
        // img의 src에서 base64 데이터를 가져와서 Blob으로 변환
        const response = await fetch(barcodeImg.src);
        const blob = await response.blob();
        
        if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ]);
            showToast('바코드 이미지가 복사되었습니다.');
        } else {
            showToast('이미지 복사가 지원되지 않습니다.');
        }
    } catch (error) {
        console.error('Copy error:', error);
        showToast('이미지 복사에 실패했습니다.');
    }
}

// 바코드 텍스트 클릭 시 선택 기능
barcodeCaption.addEventListener('click', function() {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(this);
    selection.removeAllRanges();
    selection.addRange(range);
    showToast('텍스트가 선택되었습니다. Ctrl+C로 복사하세요.');
});

// Auto 버튼 기능
autoBtn.addEventListener('click', function() {
    isAutoMode = !isAutoMode;
    this.classList.toggle('active', isAutoMode);
    localStorage.setItem('barcodeAutoMode', isAutoMode);
    showToast(isAutoMode ? 'Auto 모드 활성화' : 'Auto 모드 비활성화');
});

// Auto 모드일 때 입력 필드 클릭 시 초기화 및 붙여넣기 준비
barcodeValue.addEventListener('click', function() {
    if (isAutoMode) {
        this.value = '';
        this.focus();
        showToast('붙여넣기 준비 완료 (Ctrl+V)');
    }
});

copyBtn.addEventListener('click', copyBarcodeToClipboard);

document.addEventListener('DOMContentLoaded', () => {
    // localStorage에서 저장된 Auto 모드 설정 복원
    autoBtn.classList.toggle('active', isAutoMode);
    generateBarcode();
});