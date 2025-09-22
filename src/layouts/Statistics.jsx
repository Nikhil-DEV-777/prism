import React from 'react';
import { useMemo, useState, useEffect, useRef } from 'react';
import { SAMPLE_WORKLETS, STATUS_OPTIONS } from '../components/data';

// --- Cleaned up and consolidated icon imports ---
import {
  ChevronDown, Users, CheckCircle, Download,
  
} from 'lucide-react';

// --- Import your LeftSidebar component ---
import LeftSidebar from "../components/Left";


// HELPER COMPONENT: Injects keyframe animations into the document head
const AnimationStyles = () => (
  <style>{`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes growBar {
      from { transform: scaleY(0); }
      to { transform: scaleY(1); }
    }
    @keyframes spinIn {
      from { opacity: 0; transform: scale(0.5) rotate(-90deg); }
      to { opacity: 1; transform: scale(1) rotate(0deg); }
    }
    @keyframes pulseShadow {
        0% { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07); }
        50% { box-shadow: 0 8px 12px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1); }
        100% { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07); }
    }
  `}</style>
);

// HELPER COMPONENT: Animates numbers counting up
const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const end = value;
          const duration = 1500; // Animation duration in ms
          const startTime = performance.now();

          const animate = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const currentVal = Math.floor(progress * (end - start) + start);
            setDisplayValue(currentVal);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setDisplayValue(end);
            }
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the component is visible
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{displayValue.toLocaleString()}</span>;
};


// HELPER COMPONENT: Bar chart with animation style
const Bar = ({ value, label, maxValue, color, delay }) => {
  const barHeight = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div style={styles.barContainer}>
      <div style={styles.barValue}>{value}</div>
      <div style={{
        ...styles.bar,
        height: `${barHeight}%`,
        backgroundColor: color,
        animationDelay: delay // Stagger bar animations
      }}></div>
      <div style={styles.barLabel}>{label}</div>
    </div>
  );
};

// MAIN COMPONENT
const StatisticsDashboard = () => {
  const stats = useMemo(() => {
    const statusCounts = STATUS_OPTIONS.reduce((acc, status) => ({ ...acc, [status]: 0 }), {});
    SAMPLE_WORKLETS.forEach(w => { if (w.status in statusCounts) statusCounts[w.status]++; });

    const totalStudents = SAMPLE_WORKLETS.reduce((acc, w) => acc + w.students.length, 0);
    const totalWorklets = SAMPLE_WORKLETS.length;

    const performanceCounts = { Excellent: 0, "Very Good": 0, Good: 0, Average: 0, Poor: 0 };
    const imageQualityMap = {
        "Excellence": "Excellent",
        "Very Good": "Very Good",
        "Good": "Good",
        "Average": "Average",
        "Needs Attention": "Poor"
    };

    SAMPLE_WORKLETS.filter(w => w.status === 'Ongoing').forEach(w => {
      const performanceCategory = imageQualityMap[w.quality] || "Poor";
      if (performanceCategory in performanceCounts) {
        performanceCounts[performanceCategory]++;
      }
    });

    return { statusCounts, totalStudents, totalWorklets, performanceCounts };
  }, []);

  const engagementData = {
    Students: stats.totalStudents,
    Professors: 150,
    Mentors: 90,
    Worklets: stats.totalWorklets,
    Papers: 6,
    Patents: 2
  };

  const riskData = {
    'High Risk': 2,
    'Medium Risk': 5,
    'Low Risk': 11,
  };
  const totalRisk = Object.values(riskData).reduce((a, b) => a + b, 0);

  const statusColors = {
      Completed: '#2D3748',
      Ongoing: '#4299E1',
      'On Hold': '#ECC94B',
      Dropped: '#F6AD55',
      Terminated: '#E2E8F0',
  };
  const performanceColors = {
      Excellent: '#2D3748',
      'Very Good': '#4299E1',
      Good: '#A0AEC0',
      Average: '#F6AD55',
      Poor: '#E2E8F0',
  };
  const riskSliceColors = {
      'High Risk': '#2D3748',
      'Medium Risk': '#4299E1',
      'Low Risk': '#E2E8F0',
  };

  const maxStatusValue = Math.max(...Object.values(stats.statusCounts), 1);
  const maxPerformanceValue = Math.max(...Object.values(stats.performanceCounts), 1);

  return (
    <>
      <AnimationStyles />
      <div style={styles.pageContainer}>
        <div><LeftSidebar /></div>
        <main style={styles.mainContent}>
          <header style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.logoContainer}>
                <span style={styles.samsungLogo}>SAMSUNG</span>
                <span style={styles.prismLogo}>
                  <span style={styles.prismBracket}>&lt;/&gt;</span>PRISM
                </span>
              </div>
            </div>
            <div style={styles.headerRight}>
              <div style={styles.dropdown}>
                <button style={styles.dropdownButton}>TECH STRATEGY TEAM <ChevronDown size={16} /></button>
              </div>
              <div style={styles.dropdown}>
                <button style={styles.dropdownButton}>R&D Strategy Group <ChevronDown size={16} /></button>
              </div>
              <div style={styles.dropdown}>
                <button style={styles.dropdownButton}>All Parts <ChevronDown size={16} /></button>
              </div>
              <div style={styles.dropdown}>
                <button style={styles.dropdownButton}>All Years <ChevronDown size={16} /></button>
              </div>
            </div>
          </header>

          <div style={styles.dashboardContainer}>
            <div style={{...styles.card, animationDelay: '0.1s'}}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Overall Worklet Status</h3>
                <button style={styles.exportButton}>Export <Download size={14} style={{marginLeft: '4px'}}/></button>
              </div>
              <div style={styles.barChart}>
                {Object.entries(stats.statusCounts).map(([status, count], index) => (
                  <Bar
                    key={status}
                    label={status}
                    value={count}
                    maxValue={maxStatusValue}
                    color={statusColors[status]}
                    delay={`${index * 0.1 + 0.5}s`}
                  />
                ))}
              </div>
            </div>

            <div style={{...styles.card, animationDelay: '0.2s'}}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Total Engagement</h3>
                <button style={styles.exportButton}>Export <Download size={14} style={{marginLeft: '4px'}}/></button>
              </div>
              <div style={styles.engagementGrid}>
                {Object.entries(engagementData).map(([label, value], index) => (
                  <div key={label} style={{...styles.kpiBubble, animationDelay: `${index * 0.05 + 0.3}s`}}>
                    {label === 'Students' && <Users size={28} style={styles.kpiBubbleIcon} />}
                    {label === 'Professors' && <Users size={28} style={styles.kpiBubbleIcon} />}
                    {label === 'Mentors' && <Users size={28} style={styles.kpiBubbleIcon} />}
                    {label === 'Worklets' && <CheckCircle size={28} style={styles.kpiBubbleIcon} />}
                    {label === 'Papers' && <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.kpiBubbleIcon}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>}
                    {label === 'Patents' && <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.kpiBubbleIcon}><path d="M12 22c-3.31 0-6-2.69-6-6V6l6-4 6 4v10c0 3.31-2.69 6-6 6z"></path><path d="M12 22v-6"></path><path d="M9.5 16h5"></path><path d="M12 2L6 6h12z"></path></svg>}
                    <h4 style={styles.kpiBubbleH4}><AnimatedNumber value={value} /></h4>
                    <p style={styles.kpiBubbleP}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{...styles.card, animationDelay: '0.3s'}}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Ongoing Worklet Performance</h3>
                <button style={styles.exportButton}>Export <Download size={14} style={{marginLeft: '4px'}}/></button>
              </div>
              <div style={styles.barChart}>
                {Object.entries(stats.performanceCounts).map(([quality, count], index) => (
                  <Bar
                    key={quality}
                    label={quality}
                    value={count}
                    maxValue={maxPerformanceValue}
                    color={performanceColors[quality]}
                    delay={`${index * 0.1 + 0.5}s`}
                  />
                ))}
              </div>
            </div>

            <div style={{...styles.card, animationDelay: '0.4s'}}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Ongoing Worklet Risk</h3>
                <button style={styles.exportButton}>Export <Download size={14} style={{marginLeft: '4px'}}/></button>
              </div>
              <div style={styles.donutChartContainer}>
                <div style={{...styles.donutChartWrapper, animationDelay: '0.6s'}}>
                  <div
                    style={{
                      ...styles.donutChart,
                      background: `conic-gradient(
                        ${riskSliceColors['High Risk']} 0deg ${riskData['High Risk'] / totalRisk * 360}deg,
                        ${riskSliceColors['Medium Risk']} ${riskData['High Risk'] / totalRisk * 360}deg ${(riskData['High Risk'] + riskData['Medium Risk']) / totalRisk * 360}deg,
                        ${riskSliceColors['Low Risk']} ${(riskData['High Risk'] + riskData['Medium Risk']) / totalRisk * 360}deg 360deg
                      )`,
                    }}
                  ></div>
                  <div style={styles.donutChartCenter}>
                    <span style={styles.donutChartTotalLabel}>Total</span>
                    <span style={styles.donutChartTotalValue}><AnimatedNumber value={totalRisk} /></span>
                  </div>
                </div>
                <div style={styles.donutLegend}>
                  {Object.entries(riskData).map(([riskType, count]) => (
                    <div key={riskType} style={styles.legendItem}>
                      <span style={{...styles.legendDot, backgroundColor: riskSliceColors[riskType]}}></span>
                      {riskType} <span style={styles.legendCount}><AnimatedNumber value={count} /></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};
export default StatisticsDashboard;

// --- STYLES ---
const styles = {
  pageContainer: {
    display: 'flex',
    // CHANGED: Use height instead of minHeight and hide overflow
    height: '100vh',
    overflow : 'hidden',
    backgroundColor: '#eef2f6',
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    color: '#334155',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  sidebarWrapper: {
    position: 'sticky',
    top: 0,
    height: '100vh', // Ensures it spans the full viewport height
    overflowY: 'auto', // Allows the sidebar itself to scroll if its content is long
    flexShrink: 0, // Prevents the sidebar from shrinking
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
    position: 'sticky',
    zIndex: 10,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    marginRight: '24px',
  },
  samsungLogo: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0a1d41',
    letterSpacing: '-0.5px',
  },
  prismLogo: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#005a9e',
    display: 'flex',
    alignItems: 'baseline',
  },
  prismBracket: {
    color: '#60a5fa',
    fontSize: '18px',
    marginRight: '2px',
    fontWeight: '700',
  },
  headerRight: {
    display: 'flex',
    gap: '12px',
  },
  dropdown: {
    position: 'relative',
  },
  dropdownButton: {
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    color: '#475569',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'background-color 0.2s, border-color 0.2s',
  },
  dashboardContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
    gap: '24px',
    padding: '24px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    opacity: 0,
    transform: 'translateY(20px)',
    animation: 'fadeInUp 0.6s ease-out forwards',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
  },
  cardTitle: {
    margin: 0,
    color: '#1e293b',
    fontSize: '18px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  exportButton: {
      backgroundColor: 'transparent',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      padding: '6px 10px',
      fontSize: '13px',
      color: '#475569',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      transition: 'background-color 0.2s, border-color 0.2s, color 0.2s',
  },
  barChart: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '220px',
    padding: '16px 0',
    flexGrow: 1,
    position: 'relative',
    backgroundSize: '100% 25%',
    backgroundImage: 'linear-gradient(to top, #f1f5f9 1px, transparent 1px)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  barContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '18%',
    textAlign: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    position: 'relative',
    zIndex: 1,
  },
  bar: {
    width: '80%',
    borderRadius: '4px 4px 0 0',
    boxShadow: 'inset 0 -2px 4px rgba(0, 0, 0, 0.1)',
    transformOrigin: 'bottom',
    animation: 'growBar 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards',
  },
  barValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px',
    whiteSpace: 'nowrap',
  },
  barLabel: {
    marginTop: '12px',
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  engagementGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    textAlign: 'center',
    flexGrow: 1,
    paddingTop: '10px',
  },
  kpiBubble: {
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: '#e0f2fe',
    border: '1px solid #90cdf4',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'transform 0.2s',
    opacity: 0,
    transform: 'translateY(10px)',
    animation: 'fadeInUp 0.4s ease-out forwards',
  },
  kpiBubbleIcon: {
      color: '#1d4ed8',
      marginBottom: '8px',
  },
  kpiBubbleH4: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e3a8a',
  },
  kpiBubbleP: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#3b82f6',
    fontWeight: '500',
  },
  donutChartContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '30px',
    flexGrow: 1,
    paddingTop: '16px',
  },
  donutChartWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'spinIn 0.8s ease-out forwards',
    width: '180px',
    height: '180px',
  },
  donutChart: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
  },
  donutChartCenter: {
    position: 'absolute',
    backgroundColor: 'white',
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #e2e8f0',
  },
  donutChartTotalLabel: {
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '500',
  },
  donutChartTotalValue: {
    color: '#1e293b',
    fontSize: '26px',
    fontWeight: '700',
  },
  donutLegend: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    fontSize: '14px',
    color: '#475569',
    minWidth: '120px',
  },
  legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'color 0.2s',
  },
  legendDot: {
    height: '12px',
    width: '12px',
    borderRadius: '4px',
    display: 'inline-block',
    flexShrink: 0,
  },
  legendCount: {
      fontWeight: '600',
      color: '#1e293b',
      marginLeft: 'auto',
  }
};
