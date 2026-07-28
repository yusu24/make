import React, { useState, useEffect } from 'react';

/**
 * CurrencyInput
 * 
 * Komponen ini menerima properti yang sama seperti input teks standar, namun
 * akan otomatis memformat angka dengan pemisah ribuan (titik) saat ditampilkan.
 * 
 * - Untuk form uncontrolled (menggunakan FormData): komponen ini akan me-render
 *   input hidden dengan name yang diberikan dan nilai angka mentah (raw integer).
 * - Untuk form controlled: onChange akan memberikan objek event tiruan dengan 
 *   e.target.value = angka mentah (string tanpa titik), sehingga state induk tetap murni angka.
 */
export default function CurrencyInput({ 
    name, 
    value, 
    defaultValue, 
    onChange, 
    className, 
    placeholder, 
    required, 
    disabled,
    min,
    max,
    step,
    ...props 
}) {
    // Menentukan nilai awal (raw string)
    const initialRaw = value !== undefined ? value : (defaultValue !== undefined ? defaultValue : '');
    
    const [displayValue, setDisplayValue] = useState('');
    const [rawValue, setRawValue] = useState(initialRaw !== null && initialRaw !== undefined ? String(initialRaw) : '');

    // Fungsi format 10000 -> 10.000
    const formatValue = (val) => {
        if (val === null || val === undefined || val === '') return '';
        const numStr = String(val).replace(/\D/g, ''); // Hapus semua karakter non-digit
        if (!numStr) return '';
        return parseInt(numStr, 10).toLocaleString('id-ID'); 
    };

    // Sinkronisasi jika prop value berubah dari luar (controlled)
    useEffect(() => {
        if (value !== undefined) {
            const rawStr = value !== null && value !== undefined ? String(value).replace(/\D/g, '') : '';
            setRawValue(rawStr);
            setDisplayValue(formatValue(rawStr));
        }
    }, [value]);

    // Format nilai default saat render pertama kali (uncontrolled)
    useEffect(() => {
        if (value === undefined && defaultValue !== undefined) {
            const rawStr = defaultValue !== null && defaultValue !== undefined ? String(defaultValue).replace(/\D/g, '') : '';
            setRawValue(rawStr);
            setDisplayValue(formatValue(rawStr));
        }
    }, []);

    const handleChange = (e) => {
        const inputVal = e.target.value;
        const rawStr = inputVal.replace(/\D/g, ''); // Hanya simpan angka
        
        // Jika uncontrolled, update state lokal
        if (value === undefined) {
            setRawValue(rawStr);
            setDisplayValue(formatValue(rawStr));
        }

        if (onChange) {
            // Berikan event tiruan dengan value angka mentah (raw string)
            const synthEvent = {
                target: {
                    name,
                    value: rawStr
                }
            };
            onChange(synthEvent);
        }
    };

    return (
        <div style={{ position: 'relative', display: 'flex', width: '100%' }}>
            {/* Input Terlihat (Formatted) */}
            <input
                type="text"
                className={className}
                placeholder={placeholder}
                value={value !== undefined ? displayValue : displayValue}
                onChange={handleChange}
                required={required}
                disabled={disabled}
                {...props}
            />
            
            {/* Input Tersembunyi untuk Form Submit (Raw Value) */}
            {name && (
                <input
                    type="hidden"
                    name={name}
                    value={rawValue}
                />
            )}
        </div>
    );
}
