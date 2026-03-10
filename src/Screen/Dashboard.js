import React, { useContext, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Usercontext } from "../context/Usercontext";

const PINK = {
  primary: '#d4609a',
  light: '#fce8f5',
  medium: '#f0aed4',
  dark: '#8c2f60',
  bg: '#fff8fc',
  card: '#fff',
  border: '#f5d0e8',
  text: '#5a1f40',
  sub: '#9e6080',
};

const DashboardScreen = ({ onPlannerQuickAdd }) => {
  const { timetable, exams, plannerActivities, studyPlans } = useContext(Usercontext);
  const [period, setPeriod] = useState("today");
  const [dashboardTab, setDashboardTab] = useState("classes");
  const now = new Date();

  const periodRange = useMemo(() => {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (period === "today") {
      const end = new Date(startOfToday);
      end.setHours(23, 59, 59, 999);
      return { start: startOfToday, end };
    }
    if (period === "nextWeek") {
      const day = startOfToday.getDay();
      const daysUntilMonday = (8 - day) % 7 || 7;
      const start = new Date(startOfToday);
      start.setDate(start.getDate() + daysUntilMonday);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    const start = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59, 999);
    return { start, end };
  }, [period, now]);

  const filterLabel = useMemo(() => {
    if (period === "today") return "วันนี้";
    if (period === "nextWeek") return "สัปดาห์หน้า";
    return "เดือนหน้า";
  }, [period]);

  function timeToMinutes(time) {
    const [hours, minutes] = (time || "00:00").split(":").map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  }

  function getDayCodeFromDate(date) {
    const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return dayMap[date.getDay()];
  }

  function getNextDateForDayCode(dayCode, fromDate) {
    const dayIndexMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const target = dayIndexMap[dayCode];
    if (target === undefined) return null;
    const date = new Date(fromDate);
    date.setHours(0, 0, 0, 0);
    const diff = (target - date.getDay() + 7) % 7;
    date.setDate(date.getDate() + diff);
    return date;
  }

  function isDateInRange(date, start, end) {
    return date && date >= start && date <= end;
  }

  function getOccurrenceForClass(item, start, end) {
    const occurrence = getNextDateForDayCode(item.day, start);
    if (!isDateInRange(occurrence, start, end)) return null;
    return occurrence;
  }

  function getOccurrenceForActivity(item, start, end) {
    if (item.examDayOfMonth && item.examMonth) {
      const day = Number(item.examDayOfMonth);
      const monthIndex = Number(item.examMonth) - 1;
      if (!Number.isInteger(day) || !Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) return null;
      const candidateCurrentYear = new Date(start.getFullYear(), monthIndex, day);
      const candidate = candidateCurrentYear < start
        ? new Date(start.getFullYear() + 1, monthIndex, day)
        : candidateCurrentYear;
      if (!isDateInRange(candidate, start, end)) return null;
      return candidate;
    }
    const occurrence = getNextDateForDayCode(item.date, start);
    if (!isDateInRange(occurrence, start, end)) return null;
    return occurrence;
  }

  const filteredClasses = useMemo(() => {
    const dayOrder = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
    return timetable
      .map(item => ({ ...item, occurrence: getOccurrenceForClass(item, periodRange.start, periodRange.end) }))
      .filter(item => !!item.occurrence)
      .sort((a, b) => {
        const dayDiff = (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99);
        if (dayDiff !== 0) return dayDiff;
        return timeToMinutes(a.start) - timeToMinutes(b.start);
      });
  }, [timetable, periodRange]);

  const allPlannerActivities = useMemo(() => {
    return plannerActivities
      .map(item => ({ ...item, occurrence: getNextDateForDayCode(item.day, now) }))
      .filter(item => !!item.occurrence)
      .sort((a, b) => {
        if (a.occurrence.getTime() !== b.occurrence.getTime()) return a.occurrence.getTime() - b.occurrence.getTime();
        return timeToMinutes(a.start) - timeToMinutes(b.start);
      });
  }, [plannerActivities, now]);

  const filteredExams = useMemo(() => {
    return exams
      .map(item => ({ ...item, occurrence: getOccurrenceForActivity(item, periodRange.start, periodRange.end) }))
      .filter(item => !!item.occurrence)
      .sort((a, b) => {
        if (a.occurrence.getTime() !== b.occurrence.getTime()) return a.occurrence.getTime() - b.occurrence.getTime();
        return timeToMinutes(a.start) - timeToMinutes(b.start);
      });
  }, [exams, periodRange]);

  function formatDate(date) {
    return new Intl.DateTimeFormat("th-TH", {
      weekday: "long", day: "2-digit", month: "long", year: "numeric",
    }).format(date);
  }

  const dayIconMap = { Mon: '📚', Tue: '✏️', Wed: '🎨', Thu: '🔬', Fri: '🎵', Sat: '🌸', Sun: '☀️' };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBand}>
        <Text style={styles.appTitle}>✦ My Planner</Text>
        <Text style={styles.todayDate}>{formatDate(now)}</Text>
      </View>

      {/* Period Filter */}
      <View style={styles.filterRow}>
        {[
          { key: "today", label: "วันนี้" },
          { key: "nextWeek", label: "สัปดาห์หน้า" },
          { key: "nextMonth", label: "เดือนหน้า" },
        ].map(btn => (
          <TouchableOpacity
            key={btn.key}
            style={[styles.filterBtn, period === btn.key && styles.filterBtnActive]}
            onPress={() => setPeriod(btn.key)}
          >
            <Text style={[styles.filterText, period === btn.key && styles.filterTextActive]}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content Tab Row */}
      <View style={styles.dashboardTabRow}>
        <TouchableOpacity
          style={[styles.tabPill, dashboardTab === "classes" && styles.tabPillActive]}
          onPress={() => setDashboardTab("classes")}
        >
          <Ionicons name="book-outline" size={14} color={dashboardTab === "classes" ? "#fff" : PINK.primary} />
          <Text style={[styles.tabPillText, dashboardTab === "classes" && styles.tabPillTextActive]}>วิชาเรียน</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabPill, dashboardTab === "exams" && styles.tabPillActive]}
          onPress={() => setDashboardTab("exams")}
        >
          <Ionicons name="document-text-outline" size={14} color={dashboardTab === "exams" ? "#fff" : PINK.primary} />
          <Text style={[styles.tabPillText, dashboardTab === "exams" && styles.tabPillTextActive]}>ตารางสอบ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.splitContainer}>
        {dashboardTab === "classes" ? (
          <>
            <Text style={styles.sectionTitle}>
              <Ionicons name="school-outline" size={15} color={PINK.dark} /> วิชาเรียน — {filterLabel}
            </Text>
            {filteredClasses.length > 0 ? (
              <FlatList
                data={filteredClasses}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.classCard}>
                    <View style={styles.classCardLeft}>
                      <Text style={styles.dayEmoji}>{dayIconMap[item.day] || '📖'}</Text>
                    </View>
                    <View style={styles.classCardRight}>
                      <Text style={styles.className}>{item.name}</Text>
                      <Text style={styles.classDetail}>{getDayCodeFromDate(item.occurrence)} · {item.occurrence.toLocaleDateString("th-TH")}</Text>
                      <View style={styles.classTagRow}>
                        <View style={styles.tag}><Text style={styles.tagText}>🕐 {item.start}–{item.end}</Text></View>
                        <View style={styles.tag}><Text style={styles.tagText}>📍 {item.room}</Text></View>
                      </View>
                    </View>
                  </View>
                )}
              />
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>🌸</Text>
                <Text style={styles.emptyTitle}>ไม่มีคลาสเรียน</Text>
                <Text style={styles.emptyText}>{filterLabel}นี้ว่างอยู่นะ</Text>
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              <Ionicons name="clipboard-outline" size={15} color={PINK.dark} /> ตารางสอบ — {filterLabel}
            </Text>
            {filteredExams.length > 0 ? (
              <FlatList
                data={filteredExams}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={[styles.classCard, styles.examCard]}>
                    <View style={[styles.classCardLeft, { backgroundColor: '#ffd6eb' }]}>
                      <Text style={styles.dayEmoji}>📝</Text>
                    </View>
                    <View style={styles.classCardRight}>
                      <Text style={styles.className}>{item.title}</Text>
                      <Text style={styles.classDetail}>{getDayCodeFromDate(item.occurrence)} · {item.occurrence.toLocaleDateString("th-TH")}</Text>
                      <View style={styles.classTagRow}>
                        <View style={styles.tag}><Text style={styles.tagText}>🕐 {item.start}–{item.end}</Text></View>
                        <View style={styles.tag}><Text style={styles.tagText}>📍 {item.location}</Text></View>
                      </View>
                    </View>
                  </View>
                )}
              />
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>🎀</Text>
                <Text style={styles.emptyTitle}>ไม่มีตารางสอบ</Text>
                <Text style={styles.emptyText}>{filterLabel}นี้ว่างอยู่</Text>
              </View>
            )}
          </>
        )}

        {/* Study Plans */}
        <Text style={styles.sectionTitle}>
          <Ionicons name="bookmark-outline" size={15} color={PINK.dark} /> แผนการเรียน
        </Text>
        {studyPlans && studyPlans.length > 0 ? (
          <FlatList
            data={studyPlans}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.planCard}>
                <View style={styles.planDot} />
                <View>
                  <Text style={styles.planSubject}>{item.subject}</Text>
                  <Text style={styles.planTopic}>{item.topic}</Text>
                  <Text style={styles.planDetail}>{item.date} · {item.time}</Text>
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 8 }}
          />
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>💭</Text>
            <Text style={styles.emptyTitle}>ยังไม่มีแผนการเรียน</Text>
          </View>
        )}

        {/* Planner Activities */}
        <Text style={styles.sectionTitle}>
          <Ionicons name="calendar-outline" size={15} color={PINK.dark} /> กิจกรรมทั้งหมด
        </Text>
        {allPlannerActivities && allPlannerActivities.length > 0 ? (
          <FlatList
            data={allPlannerActivities}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.activityCard}>
                <Text style={styles.activityName}>{item.name}</Text>
                <Text style={styles.classDetail}>{getDayCodeFromDate(item.occurrence)} · {item.occurrence.toLocaleDateString("th-TH")}</Text>
                <Text style={styles.classDetail}>{item.start}–{item.end} · {item.room}</Text>
              </View>
            )}
          />
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🌷</Text>
            <Text style={styles.emptyTitle}>ไม่มีกิจกรรม</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.fab} onPress={onPlannerQuickAdd}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

function FilterButton({ label, active, onPress }) {
  return (
    <TouchableOpacity style={[styles.filterBtn, active && styles.filterBtnActive]} onPress={onPress}>
      <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PINK.bg,
  },
  headerBand: {
    backgroundColor: PINK.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: PINK.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  todayDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: PINK.border,
    borderRadius: 20,
    paddingVertical: 7,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  filterBtnActive: {
    backgroundColor: PINK.primary,
    borderColor: PINK.primary,
  },
  filterText: {
    color: PINK.sub,
    fontWeight: '600',
    fontSize: 11,
  },
  filterTextActive: {
    color: '#fff',
  },
  dashboardTabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  tabPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 20,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: PINK.border,
    backgroundColor: '#fff',
  },
  tabPillActive: {
    backgroundColor: PINK.primary,
    borderColor: PINK.primary,
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: PINK.primary,
  },
  tabPillTextActive: {
    color: '#fff',
  },
  splitContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: PINK.dark,
    marginBottom: 8,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  classCard: {
    flexDirection: 'row',
    backgroundColor: PINK.card,
    borderRadius: 14,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: PINK.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: PINK.border,
  },
  examCard: {
    borderColor: '#ffc2dd',
  },
  classCardLeft: {
    width: 52,
    backgroundColor: PINK.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayEmoji: {
    fontSize: 22,
  },
  classCardRight: {
    flex: 1,
    padding: 10,
  },
  className: {
    fontSize: 14,
    fontWeight: '700',
    color: PINK.text,
  },
  classDetail: {
    fontSize: 11,
    color: PINK.sub,
    marginTop: 2,
  },
  classTagRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  tag: {
    backgroundColor: PINK.light,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 10,
    color: PINK.dark,
    fontWeight: '600',
  },
  emptyCard: {
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PINK.border,
    padding: 16,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: PINK.text,
  },
  emptyText: {
    fontSize: 12,
    color: PINK.sub,
    marginTop: 2,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: PINK.border,
    gap: 10,
  },
  planDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PINK.primary,
    marginTop: 4,
  },
  planSubject: {
    fontWeight: '700',
    fontSize: 13,
    color: PINK.text,
  },
  planTopic: {
    fontSize: 12,
    color: PINK.sub,
    marginTop: 2,
  },
  planDetail: {
    fontSize: 11,
    color: '#b0b0b0',
    marginTop: 2,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: PINK.border,
    borderLeftWidth: 4,
    borderLeftColor: PINK.medium,
  },
  activityName: {
    fontWeight: '700',
    fontSize: 13,
    color: PINK.text,
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 88,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: PINK.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: PINK.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
});

export default DashboardScreen;
