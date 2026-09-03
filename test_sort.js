const payrollsData = [
    { period: '2026-03-01T00:00:00.000Z', baseSalary: 100 },
    { period: '2026-05-01T00:00:00.000Z', baseSalary: 200 },
    { period: '2026-04-01T00:00:00.000Z', baseSalary: 300 }
];
payrollsData.sort((a, b) => new Date(b.period) - new Date(a.period));
console.log(payrollsData[0].baseSalary); // Should be 200
