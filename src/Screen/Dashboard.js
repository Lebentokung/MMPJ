import React, { useContext, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView, Modal, TextInput, Pressable } from "react-native";
import { Usercontext } from "../context/Usercontext";

const DashboardScreen = () => {
  const { timetable, exams, plannerActivities, studyPlans, savePlannerActivities, saveStudyPlans } = useContext(Usercontext);
  const [period, setPeriod] = useState("today");
  const [dashboardTab, setDashboardTab] = useState("classes");
  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const [quickActivityName, setQuickActivityName] = useState("");
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

      if (!Number.isInteger(day) || !Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) {
        return null;
      }

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
      .map(item => ({
        ...item,
        occurrence: getOccurrenceForClass(item, periodRange.start, periodRange.end),
      }))
      .filter(item => !!item.occurrence)
      .sort((a, b) => {
        const dayDiff = (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99);
        if (dayDiff !== 0) return dayDiff;
        return timeToMinutes(a.start) - timeToMinutes(b.start);
      });
  }, [timetable, periodRange]);

  // all planner activities, sorted by upcoming date regardless of filter period
  const allPlannerActivities = useMemo(() => {
    const dayOrder = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

    return plannerActivities
      .map(item => ({
        ...item,
        occurrence: getNextDateForDayCode(item.day, now),
      }))
      .filter(item => !!item.occurrence)
      .sort((a, b) => {
        if (a.occurrence.getTime() !== b.occurrence.getTime()) {
          return a.occurrence.getTime() - b.occurrence.getTime();
        }
        return timeToMinutes(a.start) - timeToMinutes(b.start);
      });
  }, [plannerActivities, now]);

  const filteredExams = useMemo(() => {
    return exams
      .map(item => ({
        ...item,
        occurrence: getOccurrenceForActivity(item, periodRange.start, periodRange.end),
      }))
      .filter(item => !!item.occurrence)
      .sort((a, b) => {
        if (a.occurrence.getTime() !== b.occurrence.getTime()) {
          return a.occurrence.getTime() - b.occurrence.getTime();
        }
        return timeToMinutes(a.start) - timeToMinutes(b.start);
      });
  }, [exams, periodRange]);

  function formatDate(date) {
    return new Intl.DateTimeFormat("th-TH", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  function quickAddActivity() {
    const trimmedName = quickActivityName.trim();
    if (!trimmedName) {
      Alert.alert("กรุณากรอกชื่อกิจกรรม");
      return;
    }

    const todayDayCode = getDayCodeFromDate(now);
    const newActivity = {
      id: Date.now().toString(),
      name: trimmedName,
      room: "-",
      day: todayDayCode,
      start: "09:00",
      end: "10:00",
      classDate: "",
      classMonth: "",
    };

    savePlannerActivities([newActivity, ...(plannerActivities || [])]);
    setQuickActivityName("");
    setQuickAddVisible(false);
  }

  return (
    <View style={{ flex: 1, padding:15,backgroundColor:'#fff4fb' }}>
      <View style={{ flex: 1 }}>


        <Text style={styles.todayDate}>{formatDate(now)}</Text>

        <View style={styles.filterRow}>
          <FilterButton label="วันนี้" active={period === "today"} onPress={() => setPeriod("today")} />
          <FilterButton label="สัปดาห์หน้า" active={period === "nextWeek"} onPress={() => setPeriod("nextWeek")} />
          <FilterButton label="เดือนหน้า" active={period === "nextMonth"} onPress={() => setPeriod("nextMonth")} />
        </View>

        <Text style={styles.summaryLabel}>สรุปข้อมูล: {filterLabel}</Text>

        <View style={styles.dashboardTabRow}>
          <FilterButton
            label="วิชาเรียน"
            active={dashboardTab === "classes"}
            onPress={() => setDashboardTab("classes")}
          />
          <FilterButton
            label="ตารางสอบ"
            active={dashboardTab === "exams"}
            onPress={() => setDashboardTab("exams")}
          />
        </View>
        <ScrollView
          
        >


          {dashboardTab === "classes" ? (
            <>
              <Text style={styles.header}>วิชาเรียน</Text>

              {filteredClasses.length > 0 ? (
                <FlatList
                  data={filteredClasses}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <View style={styles.classItem}>
                      <Text style={styles.classText}>{item.name}</Text>
                      <Text style={styles.subText}>
                        {getDayCodeFromDate(item.occurrence)} • {item.occurrence.toLocaleDateString("th-TH")}
                      </Text>
                      <Text style={styles.detail}>{item.start} - {item.end}</Text>
                      <Text style={styles.detail}>Room: {item.room}</Text>
                    </View>
                  )}
                />
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>ไม่มีข้อมูล</Text>
                  <Text style={styles.noClasses}>Empty class schedule ({filterLabel})</Text>
                </View>
              )}
            </>
          ) : (
            <>
              <Text style={styles.header}>ตารางสอบ</Text>

              {filteredExams.length > 0 ? (
                <FlatList
                  data={filteredExams}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <View style={styles.classItem}>
                      <Text style={styles.classText}>{item.title}</Text>
                      <Text style={styles.subText}>
                        {getDayCodeFromDate(item.occurrence)} • {item.occurrence.toLocaleDateString("th-TH")}
                      </Text>
                      <Text style={styles.detail}>{item.start} - {item.end}</Text>
                      <Text style={styles.detail}>Location: {item.location}</Text>
                    </View>
                  )}
                />
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>ไม่มีข้อมูล</Text>
                  <Text style={styles.noClasses}>Empty exam schedule ({filterLabel})</Text>
                </View>
              )}
            </>
          )}

          {/* study plans */}
          <Text style={styles.header}>แผนการเรียน</Text>

          {studyPlans?.length > 0 ? (
            <FlatList
              data={studyPlans}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.classItem}>
                  <Text style={styles.classText}>{item.subject}</Text>
                  <Text style={styles.subText}>{item.topic}</Text>
                  <Text style={styles.detail}>
                    {item.date} | {item.time}
                  </Text>
                </View>
              )}
            />
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>ยังไม่มีแผนการเรียน</Text>
            </View>
          )}

          {/* activities */}
          <Text style={styles.header}>กิจกรรมทั้งหมด</Text>

          {allPlannerActivities?.length > 0 ? (
            <FlatList
              data={allPlannerActivities}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.classItem}>
                  <Text style={styles.classText}>{item.name}</Text>
                  <Text style={styles.subText}>
                    {getDayCodeFromDate(item.occurrence)} • {item.occurrence.toLocaleDateString("th-TH")}
                  </Text>
                  <Text style={styles.detail}>{item.start} - {item.end}</Text>
                  <Text style={styles.detail}>Room: {item.room}</Text>
                </View>
              )}
            />
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>ไม่มีกิจกรรม</Text>
            </View>
          )}


        </ScrollView>
      </View>

      <TouchableOpacity style={styles.fab} onPress={() => setQuickAddVisible(true)}>
        <Text style={styles.fabLabel}>+</Text>
      </TouchableOpacity>

      <Modal visible={quickAddVisible} animationType="slide" transparent onRequestClose={() => setQuickAddVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Quick Add Activity</Text>
            <TextInput
              placeholder="ชื่อกิจกรรม"
              value={quickActivityName}
              onChangeText={setQuickActivityName}
              style={styles.quickInput}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                onPress={() => {
                  setQuickAddVisible(false);
                  setQuickActivityName("");
                }}
              >
                <Text>ยกเลิก</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: "#b96aa2" }]} onPress={quickAddActivity}>
                <Text style={{ color: "#fff" }}>บันทึก</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    
    padding: 20,
    backgroundColor: "#fff4fb",
  },
  todayDate: {
    marginTop: 30,
    marginBottom: 16,
    fontSize: 20,
    fontWeight: 'bold',
    color: "#6b3550",
    marginBottom: 10,
    textAlign: "center",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2d2de",
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#faf5f8",
  },
  filterBtnActive: {
    backgroundColor: "#b96aa2",
    borderColor: "#b96aa2",
  },
  filterText: {
    color: "#6b3550",
    fontWeight: "600",
    fontSize: 12,
  },
  filterTextActive: {
    color: "#fff",
  },
  summaryLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
  },
  dashboardTabRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 12,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  classItem: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: "#f0dff0",
    borderRadius: 8,
    elevation: 1
  },
  classText: {
    fontSize: 16,
    fontWeight: '600'
  },
  subText: {
    fontSize: 12,
    color: "#666",
    marginVertical: 2,
    fontWeight: '500'
  },
  noClasses: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 4,
  },
  emptyCard: {
    marginBottom: 12,
    backgroundColor: "#f0dff0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 14,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#444",
  },
  examItem: {
    padding: 15,
    marginBottom: 10,
  },
  splitContainer: {
    gap: 10,
  },

  card: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginVertical: 6, backgroundColor: '#f0dff0', elevation: 1 },
  subject: { fontWeight: '700', fontSize: 16 },
  topic: { marginTop: 4, color: '#444' },
  detail: { marginTop: 2, fontSize: 12, color: '#888' },
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalBox: { backgroundColor: '#fff', margin: 20, padding: 16, borderRadius: 8 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 6 },
  quickInput: { borderWidth: 1, borderColor: '#eee', padding: 10, borderRadius: 6, marginTop: 4, backgroundColor: '#fff' },
  fab: { position: 'absolute', right: 18, bottom: 88, width: 56, height: 56, borderRadius: 28, backgroundColor: '#d184b8', alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  fabLabel: { color: '#fff', fontSize: 28, fontWeight: '700', lineHeight: 30 },
});

export default DashboardScreen;