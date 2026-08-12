const fs = require('fs');

function fixAadharPay() {
  const jsxFile = 'src/member/components/MemberPanel/Services/AadharPay.jsx';
  let jsx = fs.readFileSync(jsxFile, 'utf8');

  // 1. Add useIsMobile hook
  const hookDef = `
const useIsMobile = () => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 600px)');
    const update = () => setTick(n => n + 1);
    mq.addEventListener('change', update);
    window.addEventListener('resize', update);
    return () => { mq.removeEventListener('change', update); window.removeEventListener('resize', update); };
  }, []);
  return window.matchMedia('(max-width: 600px)').matches || window.innerWidth <= 600;
};
`;
  if (!jsx.includes('useIsMobile')) {
    jsx = jsx.replace('const AadharPay = () => {', hookDef + '\nconst AadharPay = () => {');
  }

  // 2. Add isMobile to component
  if (!jsx.includes('const isMobile = useIsMobile();')) {
    jsx = jsx.replace('const AadharPay = () => {\n', 'const AadharPay = () => {\n  const isMobile = useIsMobile();\n');
  }

  // 3. Make tabs responsive in portal (Cash Withdrawal etc)
  const tabContainer = `<div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '12px', gap: '4px' }}>
                {[
                { id: 'AADHARPAY', label: 'Cash Withdrawal',`;
  const resTabContainer = `<div style={{ display: 'flex', flexWrap: 'wrap', background: '#F1F5F9', padding: '4px', borderRadius: '12px', gap: '4px' }}>
                {[
                { id: 'AADHARPAY', label: 'Cash Withdrawal',`;
  jsx = jsx.replace(tabContainer, resTabContainer);

  // 4. Make guidelines right column responsive
  const guidelinesHeader = `<div style={{
            background: '#ffffff', borderRadius: '24px', padding: '24px',
            boxShadow: '0 10px 30px rgba(13, 27, 62, 0.05)', border: '1px solid #E2E8F0',
            display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '320px', flex: '1 1 350px'
          }}>`;
  const resGuidelinesHeader = `<div style={{
            background: '#ffffff', borderRadius: isMobile ? '16px' : '24px', padding: isMobile ? '16px' : '24px',
            boxShadow: '0 10px 30px rgba(13, 27, 62, 0.05)', border: '1px solid #E2E8F0',
            display: 'flex', flexDirection: 'column', gap: '20px', minWidth: isMobile ? '100%' : '320px', flex: '1 1 350px',
            overflow: 'hidden'
          }}>`;
  jsx = jsx.replace(guidelinesHeader, resGuidelinesHeader);
  
  // 5. Make tabs header in right column responsive
  const rightTabsHeader = `{/* Tabs Header */}
            <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '12px', gap: '4px' }}>`;
  const resRightTabsHeader = `{/* Tabs Header */}
            <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '12px', gap: '4px', overflowX: 'auto', whiteSpace: 'nowrap' }}>`;
  jsx = jsx.replace(rightTabsHeader, resRightTabsHeader);

  fs.writeFileSync(jsxFile, jsx);

  // Fix CSS
  const cssFile = 'src/member/components/MemberPanel/Services/AadharPay.module.css';
  let css = fs.readFileSync(cssFile, 'utf8');
  
  const oldMainLayout = `.mainLayout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  width: 100%;
}`;
  const newMainLayout = `.mainLayout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}`;
  if (css.includes(oldMainLayout)) {
    css = css.replace(oldMainLayout, newMainLayout);
    fs.writeFileSync(cssFile, css);
  }
}
fixAadharPay();
console.log('Fixed AadharPay responsiveness');
