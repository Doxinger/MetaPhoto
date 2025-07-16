$(document).ready(function() {
    const themeToggle = $('#themeToggle');
    const body = $('body');
    const currentTheme = localStorage.getItem('theme');
    
    if (currentTheme) {
        body.addClass(currentTheme);
        updateThemeIcon(currentTheme);
    }
    
    themeToggle.on('click', function() {
        body.toggleClass('dark-theme');
        const newTheme = body.hasClass('dark-theme') ? 'dark-theme' : 'light-theme';
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
    
    function updateThemeIcon(theme) {
        const icon = themeToggle.find('i');
        if (theme === 'dark-theme') {
            icon.removeClass('fa-moon').addClass('fa-sun');
        } else {
            icon.removeClass('fa-sun').addClass('fa-moon');
        }
    }
    
    const dropZone = $('#dropZone');
    const fileInput = $('#fileInput');
    const selectFileBtn = $('#selectFileBtn');
    const resultSection = $('#resultSection');
    const resetBtn = $('#resetBtn');
    
    selectFileBtn.on('click', function() {
        fileInput.click();
    });
    
    fileInput.on('change', function(e) {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });
    
    dropZone.on('dragover', function(e) {
        e.preventDefault();
        dropZone.addClass('dragover');
    });
    
    dropZone.on('dragleave', function() {
        dropZone.removeClass('dragover');
    });
    
    dropZone.on('drop', function(e) {
        e.preventDefault();
        dropZone.removeClass('dragover');
        
        if (e.originalEvent.dataTransfer.files.length) {
            handleFile(e.originalEvent.dataTransfer.files[0]);
        }
    });
    
    resetBtn.on('click', function() {
        resetApp();
    });
    
    $('.tab-btn').on('click', function() {
        const tabId = $(this).data('tab');
        
        $('.tab-btn').removeClass('active');
        $(this).addClass('active');
        
        $('.tab-pane').removeClass('active');
        $(`#${tabId}-tab`).addClass('active');
    });
    
    function handleFile(file) {
        if (!file.type.match('image.*')) {
            alert('Пожалуйста, выберите файл изображения');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const imagePreview = $('#imagePreview');
            imagePreview.html(`<img src="${e.target.result}" alt="Preview">`);
            
            processMetadata(file, e.target.result);
            
            resultSection.removeClass('hidden').addClass('show');
            $('html, body').animate({
                scrollTop: resultSection.offset().top - 20
            }, 500);
        };
        
        reader.readAsDataURL(file);
    }
    
    function processMetadata(file, imageData) {
        const basicInfo = $('#basicInfo');
        basicInfo.empty();
        
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        const fileType = file.type;
        const lastModified = new Date(file.lastModified).toLocaleString();
        
        basicInfo.append(`
            <div class="info-item">
                <div class="info-item__label">Имя файла</div>
                <div class="info-item__value">${file.name}</div>
            </div>
            <div class="info-item">
                <div class="info-item__label">Размер</div>
                <div class="info-item__value">${fileSize} MB</div>
            </div>
            <div class="info-item">
                <div class="info-item__label">Тип</div>
                <div class="info-item__value">${fileType}</div>
            </div>
            <div class="info-item">
                <div class="info-item__label">Изменен</div>
                <div class="info-item__value">${lastModified}</div>
            </div>
        `);
        const img = new Image();
        img.src = imageData;
        
        img.onload = function() {
            EXIF.getData(img, function() {
                const exifData = $('#exifData');
                const allData = $('#allData');
                exifData.empty();
                allData.empty();
                
                const allExifData = EXIF.getAllTags(this);
                
                if (Object.keys(allExifData).length === 0) {
                    exifData.html('<p class="no-data">Нет EXIF данных</p>');
                } else {
                    for (const [tag, value] of Object.entries(allExifData)) {
                        if (value !== undefined) {
                            const formattedValue = formatExifValue(tag, value);
                            exifData.append(`
                                <div class="metadata-item">
                                    <div class="metadata-item__tag">${tag}</div>
                                    <div class="metadata-item__value">${formattedValue}</div>
                                </div>
                            `);
                            
                            allData.append(`
                                <div class="metadata-item">
                                    <div class="metadata-item__tag">EXIF.${tag}</div>
                                    <div class="metadata-item__value">${formattedValue}</div>
                                </div>
                            `);
                        }
                    }
                }
            });
        }; 
        $('#iptcData').html('<p class="no-data">Для просмотра IPTC данных требуется дополнительная библиотека</p>');
        $('#xmpData').html('<p class="no-data">Для просмотра XMP данных требуется дополнительная библиотека</p>');
    }
    
    function formatExifValue(tag, value) {
        if (tag === 'GPSLatitude' || tag === 'GPSLongitude') {
            return EXIF.getTag(this, tag) + ' ' + EXIF.getTag(this, tag.replace('itude', 'itudeRef'));
        }
        
        if (typeof value === 'string' && value.match(/^\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}$/)) {
            return value.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
        }
        
        if (Array.isArray(value)) {
            return value.join(', ');
        }
        
        return value;
    }
    
    function resetApp() {
        fileInput.val('');
        resultSection.removeClass('show').addClass('hidden');
        setTimeout(() => {
            resultSection.addClass('hidden');
        }, 500);
    }
});
