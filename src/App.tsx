import React, { useState, useMemo, useRef } from 'react';
import { HealthRecord, ScreeningResult, RuleThresholds, ColumnMapping } from './types/health';
import { DEMO_HEALTH_ROSTER } from './data/mockData';
import { screenPatientRecord, DEFAULT_THRESHOLDS } from './utils/ruleEngine';
import { readExcelFilesUnified, autoDetectMapping, mapRowsToHealthRecords, exportResultsToExcel, downloadExcelTemplate, exportNameAndAnomaliesExcel } from './utils/excelParser';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { RosterTable } from './components/RosterTable';
import { ColumnMappingModal } from './components/ColumnMappingModal';
import { PatientDetailModal } from './components/PatientDetailModal';
import { RuleGuideModal } from './components/RuleGuideModal';
import { RuleConfigModal } from './components/RuleConfigModal';
import { PasteDataModal } from './components/PasteDataModal';
import { PythonScriptModal } from './components/PythonScriptModal';
import { StatsDashboardView } from './components/StatsDashboardView';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState<HealthRecord[]>(DEMO_HEALTH_ROSTER);
  const [thresholds, setThresholds] = useState<RuleThresholds>(DEFAULT_THRESHOLDS);
  const [activeRuleFilter, setActiveRuleFilter] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<'table' | 'stats' | 'rules'>('table');
  const [selectedPatient, setSelectedPatient] = useState<ScreeningResult | null>(null);
  const [hasCustomData, setHasCustomData] = useState(false);

  // 模态框控制
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [isPyModalOpen, setIsPyModalOpen] = useState(false);

  // 列映射模态框状态
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [pendingFileName, setPendingFileName] = useState('');
  const [pendingCols, setPendingCols] = useState<string[]>([]);
  const [pendingRows, setPendingRows] = useState<any[]>([]);
  const [pendingMapping, setPendingMapping] = useState<ColumnMapping>({} as ColumnMapping);

  // 文件上传输入
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 核心筛查计算（记忆化）
  const screeningResults: ScreeningResult[] = useMemo(() => {
    return records.map((rec) => screenPatientRecord(rec, thresholds));
  }, [records, thresholds]);

  // 处理文件上传选择 (支持同时多选文件，如：生化表、超声表、血常规表)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processUploadedFiles(Array.from(files));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 处理拖拽或上传
  const processUploadedFiles = async (files: File[]) => {
    try {
      const { columns, rows, mergedInfo } = await readExcelFilesUnified(files);
      if (rows.length === 0) {
        showToast('所选文件为空或未包含有效数据行', 'error');
        return;
      }
      const mapping = autoDetectMapping(columns);
      const nameTitle = files.length > 1 ? `已按身份证自动关联 ${files.length} 个文件` : files[0].name;
      setPendingFileName(nameTitle);
      setPendingCols(columns);
      setPendingRows(rows);
      setPendingMapping(mapping);
      setIsMappingModalOpen(true);
      if (mergedInfo) {
        showToast(mergedInfo, 'success');
      }
    } catch (err: any) {
      console.error(err);
      showToast('文件解析失败，请确保上传为标准 .xlsx、.xls 或 .csv 文件', 'error');
    }
  };

  // 确认列映射
  const handleConfirmMapping = (confirmedMapping: ColumnMapping) => {
    try {
      const mappedRecords = mapRowsToHealthRecords(pendingRows, confirmedMapping);
      setRecords(mappedRecords);
      setHasCustomData(true);
      setIsMappingModalOpen(false);
      setActiveRuleFilter(null);
      showToast(`成功导入并筛查 ${mappedRecords.length} 名老年人体检记录！`, 'success');
    } catch (err) {
      console.error(err);
      showToast('转换数据时发生错误，请检查映射列', 'error');
    }
  };

  // 恢复内置示范数据
  const handleResetDemoData = () => {
    setRecords(DEMO_HEALTH_ROSTER);
    setHasCustomData(false);
    setActiveRuleFilter(null);
    showToast('已重载示范体检花名册（包含20位各类典型老年人阳性案例）', 'success');
  };

  // 导出 Excel
  const handleExport = (type: 'positive_only' | 'all') => {
    try {
      exportResultsToExcel(screeningResults, type);
      showToast(`已开始下载 ${type === 'positive_only' ? '阳性人群' : '全员筛查'} Excel 文件`, 'success');
    } catch (err) {
      console.error(err);
      showToast('导出 Excel 失败', 'error');
    }
  };

  // 导出【姓名+异常项】精简 Excel
  const handleExportNameAndAnomalies = () => {
    try {
      exportNameAndAnomaliesExcel(screeningResults);
      showToast('已开始下载【姓名+异常项清单】精简 Excel 文件', 'success');
    } catch (err) {
      console.error(err);
      showToast('导出 Excel 失败', 'error');
    }
  };

  // 下载纯离线单文件版 HTML
  const handleDownloadOfflineHtml = () => {
    const link = document.createElement('a');
    link.href = '/offline.html';
    link.download = '老年人体检阳性体征筛查系统_纯离线单文件版.html';
    link.click();
    showToast('已开始下载【纯离线单文件版 HTML】，可拷贝至U盘在断网电脑双击直接使用！', 'success');
  };

  // 下载整个离线工程项目 ZIP
  const handleDownloadZip = () => {
    const link = document.createElement('a');
    link.href = '/elderly_health_screening_project.zip';
    link.download = '老年人体检阳性体征筛查完整工程离线包.zip';
    link.click();
    showToast('已开始下载【完整离线工程 ZIP 包】（含全部配置、源码与双击运行文件）！', 'success');
  };

  // 接收从网页复制粘贴的数据
  const handleDataFromPaste = (columns: string[], rows: any[], mapping: ColumnMapping) => {
    setPendingFileName('网页复制粘贴数据');
    setPendingCols(columns);
    setPendingRows(rows);
    setPendingMapping(mapping);
    setIsMappingModalOpen(true);
  };

  // 拖拽文件进入
  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processUploadedFiles(Array.from(files));
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans"
    >
      {/* 隐藏的实际文件输入 (支持按住Ctrl多选文件) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx, .xls, .csv"
        multiple
        className="hidden"
      />

      {/* 顶部导航 */}
      <Header
        onUploadClick={() => fileInputRef.current?.click()}
        onOpenPasteModal={() => setIsPasteModalOpen(true)}
        onOpenPyModal={() => setIsPyModalOpen(true)}
        onDownloadTemplate={downloadExcelTemplate}
        onDownloadOfflineHtml={handleDownloadOfflineHtml}
        onDownloadZip={handleDownloadZip}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        onOpenSettings={() => setIsConfigModalOpen(true)}
        onResetDemoData={handleResetDemoData}
        activeView={activeView}
        setActiveView={setActiveView}
        hasCustomData={hasCustomData}
      />

      {/* 页面主视图 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* 拖拽上传全局遮罩 */}
        {isDragging && (
          <div className="fixed inset-0 z-40 bg-teal-900/60 backdrop-blur-xs flex items-center justify-center p-6 border-4 border-dashed border-teal-300">
            <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md">
              <UploadCloud className="w-16 h-16 text-teal-700 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">释放鼠标立即解析体检表</h3>
              <p className="text-xs text-slate-500 mt-1">支持 Excel (.xlsx, .xls) 或 CSV 文件格式</p>
            </div>
          </div>
        )}

        {/* 顶部提示 Toast */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-medium flex items-center gap-2 transition-all ${
              toastMessage.type === 'success'
                ? 'bg-white border-teal-200 text-teal-900'
                : 'bg-white border-rose-200 text-rose-900'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-teal-700" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* 视图1: 体检花名册主台 */}
        {activeView === 'table' && (
          <div className="space-y-6">
            {/* 统计指标卡 */}
            <StatsCards
              results={screeningResults}
              activeRuleFilter={activeRuleFilter}
              onSelectRule={setActiveRuleFilter}
            />

            {/* 花名册表格组件 */}
            <RosterTable
              results={screeningResults}
              activeRuleFilter={activeRuleFilter}
              onSelectRule={setActiveRuleFilter}
              onViewRecord={(item) => setSelectedPatient(item)}
              onExportExcel={handleExport}
              onExportNameAndAnomalies={handleExportNameAndAnomalies}
            />
          </div>
        )}

        {/* 视图2: 筛查统计看板 */}
        {activeView === 'stats' && (
          <StatsDashboardView
            results={screeningResults}
            onSelectRule={(ruleId) => {
              setActiveRuleFilter(ruleId);
              setActiveView('table');
            }}
            onSwitchToTable={() => setActiveView('table')}
          />
        )}

        {/* 视图3: 11项标准规范解读 */}
        {activeView === 'rules' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h2 className="text-base font-bold text-slate-900">
                国家基本公卫老年人健康管理体检表阳性体征11项核心规范
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                本系统严格根据国家规范研制，已内置多层逻辑解析血压危象、高危血糖、肝肾功能、血脂分层、心电图危急征、血尿常规、B超DR占位及高尿酸血症。
              </p>
            </div>
            {/* 直接复用指南展示 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: 1,
                  title: '① 血压危象/重度高血压',
                  rule: '收缩压 ≥ 180mmHg 或 舒张压 ≥ 110mmHg',
                  desc: '老年高血压患者极易诱发脑出血、主动脉夹层或急性心衰，需立即平卧复测，若持续偏高启动绿色通道转诊。',
                },
                {
                  id: 2,
                  title: '② 血糖极值危象',
                  rule: '血糖 ≤ 3.9mmol/L 或 ≥ 16.7mmol/L',
                  desc: '低血糖症（≤3.9）极易引发老年意识障碍与心脑血管猝死；≥16.7mmol/L需排查高渗状态与酮症酸中毒。',
                },
                {
                  id: 3,
                  title: '③ 肝功能明显异常',
                  rule: '总胆红素 ＞ 34.2μmol/L；ALT ＞ 80U/L；AST ＞ 80U/L 中任意一项异常',
                  desc: '提示明显肝细胞坏死或胆道梗阻，需警惕病毒性肝炎、药物性肝损伤或胆总管结石。',
                },
                {
                  id: 4,
                  title: '④ 血脂异常分层筛查',
                  rule: '普通人: TG≥5.6/TC≥7.2/LDL≥4.9；高血压患者: TG≥5.2或LDL＞3.4；高血压+糖尿病双患: LDL≥1.8',
                  desc: '双慢病患者属于动脉粥样硬化性心血管病极高危人群，LDL-C目标值必须严格控制在1.8mmol/L以下。',
                },
                {
                  id: 5,
                  title: '⑤ 心血管危急征象',
                  rule: '有胸痛胸闷心悸等症状 + 心电图异常(陈旧心梗、病理Q波、ST-T改变、快速房颤、三度房室阻滞等)',
                  desc: '临床症状与器质性心电图异常并存，属于急性冠脉综合征、心肌缺血或恶性心律失常高危预警。',
                },
                {
                  id: 6,
                  title: '⑥ 肾功能异常',
                  rule: '肌酐 ≥ 124μmol/L；尿素氮 ＞ 9mmol/L 中任意一项异常',
                  desc: '提示肾功能不全或氮质血症，应复查肾小球滤过率并审查降压降糖药物的肾毒性。',
                },
                {
                  id: 7,
                  title: '⑦ 血常规三系严重异常',
                  rule: '血红蛋白 ＜ 90g/L；白细胞 ＞ 10 或 ＜ 4×10^9/L；血小板 ＜ 50 或 ＞ 300×10^9/L',
                  desc: '中重度贫血、严重感染或凝血血小板重度减低，有自发性出血或严重并发症风险。',
                },
                {
                  id: 8,
                  title: '⑧ 尿常规异常',
                  rule: '尿蛋白 ≥ 1+；尿红细胞 ≥ 1+；尿潜血 ≥ 1+；尿蛋白和尿酮体同时 ≥ 1+ 中任意一项异常',
                  desc: '早期肾脏损害或代谢紊乱体征，尿蛋白与尿酮体同时阳性需警惕糖尿病代谢紊乱。',
                },
                {
                  id: 9,
                  title: '⑨ 腹部B超重大异常',
                  rule: '重度脂肪肝；肝囊肿 ≥ 5cm；肾囊肿 ≥ 5cm；胆囊息肉 ≥ 1.0cm；占位性病变 中任意一项异常',
                  desc: '囊肿≥5cm有破裂压迫风险；胆囊息肉≥1.0cm癌变率高；占位病变需尽快强化CT排查肿瘤。',
                },
                {
                  id: 10,
                  title: '⑩ 胸部DR重大异常',
                  rule: '胸部DR / 胸片提示占位性病变、肺肿块或疑似恶性占位',
                  desc: '肺癌高危筛查重点，发现占位征象必须立即专科转诊行胸部增强CT排查。',
                },
                {
                  id: 11,
                  title: '⑪ 高尿酸血症',
                  rule: '血尿酸 ≥ 420μmol/L (420μmol)',
                  desc: '尿酸结晶沉积可引发痛风发作与肾结石，加剧代谢综合征与心脑血管硬化进程。',
                },
              ].map((item) => (
                <div key={item.id} className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 text-xs">{item.title}</div>
                  <div className="text-xs font-semibold text-teal-800 bg-teal-50 p-2 rounded border border-teal-100">
                    判定标准: {item.rule}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 底部信息栏 */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
          老年人健康管理体检阳性体征筛查系统 · 本地浏览器高保密处理，体检隐私数据不经外部服务器传输
        </div>
      </footer>

      {/* 居民详情与转诊通知书模态框 */}
      <PatientDetailModal
        item={selectedPatient}
        onClose={() => setSelectedPatient(null)}
      />

      {/* 列映射模态框 */}
      <ColumnMappingModal
        isOpen={isMappingModalOpen}
        columns={pendingCols}
        initialMapping={pendingMapping}
        rowCount={pendingRows.length}
        fileName={pendingFileName}
        onConfirm={handleConfirmMapping}
        onCancel={() => setIsMappingModalOpen(false)}
      />

      {/* 规则指南模态框 */}
      <RuleGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      {/* 阈值参数设置模态框 */}
      <RuleConfigModal
        isOpen={isConfigModalOpen}
        currentThresholds={thresholds}
        onSave={(newThresholds) => {
          setThresholds(newThresholds);
          showToast('阈值参数已更新，系统已自动重新执行筛查！', 'success');
        }}
        onClose={() => setIsConfigModalOpen(false)}
      />

      {/* 网页直接复制粘贴模态框 */}
      <PasteDataModal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        onDataParsed={handleDataFromPaste}
      />

      {/* Python 离线脚本与免环境方案模态框 */}
      <PythonScriptModal
        isOpen={isPyModalOpen}
        onClose={() => setIsPyModalOpen(false)}
      />
    </div>
  );
}
