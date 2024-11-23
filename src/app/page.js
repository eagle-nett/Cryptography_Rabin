'use client';

import { useState } from 'react';

// Hàm kiểm tra số nguyên tố
function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

// Hàm tìm căn bậc hai mô-đun (modular square root) kèm log
function modularSqrt(a, p, log) {
  for (let x = 0; x < p; x++) {
    if ((x * x) % p === a % p) {
      log.push(`modularSqrt(${a}, ${p}): Found x = ${x}`);
      return x;
    }
  }
  log.push(`modularSqrt(${a}, ${p}): No square root found`);
  throw new Error(`No modular square root found for ${a} mod ${p}`);
}

// Thuật toán Trung Hoa (CRT) kèm log
function chineseRemainderTheorem(a1, m1, a2, m2, log) {
  const m = m1 * m2;
  const m1Inverse = modularInverse(m1, m2, log);
  const m2Inverse = modularInverse(m2, m1, log);
  const result = ((a1 * m2 * m2Inverse) + (a2 * m1 * m1Inverse)) % m;
  log.push(
    `CRT(${a1}, ${m1}, ${a2}, ${m2}): Result = ${result}`
  );
  return result;
}

// Hàm tìm nghịch đảo mô-đun kèm log
function modularInverse(a, m, log) {
  let m0 = m, t, q;
  let x0 = 0, x1 = 1;
  if (m === 1) return 0;
  while (a > 1) {
    q = Math.floor(a / m);
    t = m;
    m = a % m;
    a = t;
    t = x0;
    x0 = x1 - q * x0;
    x1 = t;
  }
  const result = x1 < 0 ? x1 + m0 : x1;
  log.push(`modularInverse(${a}, ${m0}): Result = ${result}`);
  return result;
}

// Hàm mã hóa Rabin kèm log
function rabinEncrypt(m, n, log) {
  const c = (m * m) % n;
  log.push(`Encrypt: c = m^2 mod n = (${m}^2) mod ${n} = ${c}`);
  return c;
}

// Hàm giải mã Rabin kèm log
function rabinDecrypt(c, p, q, log) {
  const r1 = modularSqrt(c, p, log);
  const r2 = p - r1;
  const s1 = modularSqrt(c, q, log);
  const s2 = q - s1;

  const m1 = chineseRemainderTheorem(r1, p, s1, q, log);
  const m2 = chineseRemainderTheorem(r1, p, s2, q, log);
  const m3 = chineseRemainderTheorem(r2, p, s1, q, log);
  const m4 = chineseRemainderTheorem(r2, p, s2, q, log);

  log.push(`Decrypt: Possible messages = [${m1}, ${m2}, ${m3}, ${m4}]`);
  return [m1, m2, m3, m4];
}

// Component chính
export default function RabinApp() {
  const [p, setP] = useState('');
  const [q, setQ] = useState('');
  const [message, setMessage] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [decrypted, setDecrypted] = useState([]);
  const [executionLog, setExecutionLog] = useState([]);
  const [error, setError] = useState('');

  const handleEncrypt = (e) => {
    e.preventDefault();
    setError('');
    const log = [];

    try {
      const pValue = parseInt(p);
      const qValue = parseInt(q);
      const mValue = parseInt(message);

      if (!isPrime(pValue) || !isPrime(qValue)) {
        throw new Error('p và q phải là số nguyên tố!');
      }
      if (mValue >= pValue * qValue) {
        throw new Error('Message phải nhỏ hơn n = p * q!');
      }

      const n = pValue * qValue;
      const c = rabinEncrypt(mValue, n, log);
      setCiphertext(c);
      setExecutionLog(log);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDecrypt = (e) => {
    e.preventDefault();
    setError('');
    const log = [];

    try {
      const pValue = parseInt(p);
      const qValue = parseInt(q);
      const cValue = parseInt(ciphertext);

      if (!isPrime(pValue) || !isPrime(qValue)) {
        throw new Error('p và q phải là số nguyên tố!');
      }

      const possibleMessages = rabinDecrypt(cValue, pValue, qValue, log);
      setDecrypted(possibleMessages);
      setExecutionLog(log);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-5">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Rabin Encryption</h1>
        {error && <p className="text-red-500">{error}</p>}

        {/* Form mã hóa */}
        <form onSubmit={handleEncrypt} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-lg font-medium">Prime p:</label>
            <input
              type="number"
              value={p}
              onChange={(e) => setP(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-lg font-medium">Prime q:</label>
            <input
              type="number"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-lg font-medium">Message (m):</label>
            <input
              type="number"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md text-lg font-semibold hover:bg-blue-700 transition"
          >
            Encrypt
          </button>
        </form>

        {ciphertext && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-700">Ciphertext:</h2>
            <p className="bg-gray-100 p-4 rounded-md">{ciphertext}</p>
          </div>
        )}

        {/* Form giải mã */}
        {ciphertext && (
          <form onSubmit={handleDecrypt} className="mt-6 space-y-6">
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-md text-lg font-semibold hover:bg-green-700 transition"
            >
              Decrypt
            </button>
          </form>
        )}

        {decrypted.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-700">Possible Messages:</h2>
            <ul className="list-disc list-inside bg-gray-100 p-4 rounded-md">
              {decrypted.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Bảng thực thi */}
        {executionLog.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-700">Execution Log:</h2>
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-4 py-2">Step</th>
                  <th className="border border-gray-300 px-4 py-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {executionLog.map((log, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                    <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                    <td className="border border-gray-300 px-4 py-2">{log}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
