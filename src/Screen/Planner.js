import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, Modal, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Usercontext } from '../context/Usercontext';
import { StatusBar } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

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

export default function PlannerScreen({ plannerAddRequest, clearPlannerAddRequest }) {
  const { plannerActivities, studyPlans, savePlannerActivities, saveStudyPlans } = useContext(Usercontext);
  const activities = plannerActivities || [];
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [day, setDay] = useState('Mon');
  const [classDate, setClassDate] = useState('');
  const [classMonth, setClassMonth] = useState('');
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('10:00');

  const [viewMode, setViewMode] = useState('classes');
  // previously used local state for checkboxes; now persist flag on each plan
  function togglePlan(id) {
    const updated = plans.map(p =>
      p.id === id ? { ...p, checked: !p.checked } : p
    );
    saveStudyPlans(updated);
  }

  const dayColors = { Mon: '#ffd6e8', Tue: '#fce0f5', Wed: '#f5d6ff', Thu: '#e8d6ff', Fri: '#d6e8ff', Sat: '#d6f5e8', Sun: '#fff0d6' };
  const dayEmoji = { Mon: '📚', Tue: '✏️', Wed: '🎨', Thu: '🔬', Fri: '🎵', Sat: '🌸', Sun: '☀️' };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayNames = {
    'Mon': 'Monday',
    'Tue': 'Tuesday',
    'Wed': 'Wednesday',
    'Thu': 'Thursday',
    'Fri': 'Friday',
    'Sat': 'Saturday',
    'Sun': 'Sunday'
  };

  // study plan state
  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const plans = studyPlans || [];

  function addPlan() {
    if (!subject || !topic || !date || !time) {
      Alert.alert('กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    if (editingPlanId) {
      // update existing plan while preserving checked flag
      saveStudyPlans(plans.map(p =>
        p.id === editingPlanId ? { ...p, subject, topic, date, time } : p
      ));
      setEditingPlanId(null);
    } else {
      const newPlan = {
        id: Date.now().toString(),
        subject,
        topic,
        date,
        time,
        checked: false,
      };
      saveStudyPlans([...plans, newPlan]);
    }

    setSubject('');
    setTopic('');
    setDate('');
    setTime('');
    setPlanModalVisible(false);
  }

  function deletePlan(id) {
    saveStudyPlans(plans.filter(item => item.id !== id));
  }

  function openEditPlan(plan) {
    setEditingPlanId(plan.id);
    setSubject(plan.subject);
    setTopic(plan.topic);
    setDate(plan.date);
    setTime(plan.time);
    setPlanModalVisible(true);
  }

  function renderItem({ item }) {
    return (
      <View style={styles.card}>
        <View>
          <Text style={styles.subject}>{item.subject}</Text>
          <Text style={styles.topic}>{item.topic}</Text>
          <Text style={styles.detail}>{item.date} | {item.time}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => togglePlan(item.id)}
            style={[styles.checkbox, item.checked && styles.checkboxChecked, { marginRight: 8 }]}
          >
            {item.checked && <Text style={{ color: '#fff' }}>✓</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rowBtn, { marginRight: 8 }]}
            onPress={() => openEditPlan(item)}
          >
            <Text style={{ color: '#000000' }}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => deletePlan(item.id)}
          >
            <Text style={{ color: 'Black' }}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // exam-related functions are no longer used since the tab has been removed

  function openAdd() {
    setEditingId(null);
    setName(''); setRoom(''); setDay('Mon'); setClassDate(''); setClassMonth(''); setStart('09:00'); setEnd('10:00');
    setModalVisible(true);
  }

  // if parent requests an add, show modal once then clear
  React.useEffect(() => {
    if (plannerAddRequest) {
      openAdd();
      clearPlannerAddRequest();
    }
  }, [plannerAddRequest]);

  function addActivity() {
    if (!name.trim()) return Alert.alert('Please add an activity name');

    const hasClassConflict = hasTimeConflict(day, start, end, editingId);

    if (hasClassConflict) {
      return Alert.alert('เวลาใช้งานซ้ำ', 'เวลานี้ทับกับกิจกรรมที่มีอยู่แล้ว กรุณาเลือกเวลาใหม่');
    }

    if (editingId) {
      const newList = activities.map(it => it.id === editingId ? { ...it, name, room, day, classDate, classMonth, start, end } : it);
      savePlannerActivities(newList);
      setEditingId(null);
    } else {
      const item = { id: Date.now().toString(), name, room, day, classDate, classMonth, start, end };
      savePlannerActivities([item, ...activities]);
    }
    setModalVisible(false);
  }

  function openEdit(item) {
    setEditingId(item.id);
    setName(item.name || ''); setRoom(item.room || ''); setDay(item.day || 'Mon'); setClassDate(item.classDate || ''); setClassMonth(item.classMonth || ''); setStart(item.start || '09:00'); setEnd(item.end || '10:00');
    setModalVisible(true);
  }

  function remove(classItem) {
    Alert.alert('Delete', 'Remove this class?', [{ text: 'Cancel' }, {
      text: 'OK',
      onPress: () => {
        const filteredClasses = activities.filter(i => i.id !== classItem.id);
        savePlannerActivities(filteredClasses);
      }
    }]);
  }

  function hasTimeConflict(dayStr, startTime, endTime, excludeId = null) {
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);

    return activities.some(item => {
      if (item.day !== dayStr) return false;
      if (excludeId && item.id === excludeId) return false;

      const itemStartMin = timeToMinutes(item.start);
      const itemEndMin = timeToMinutes(item.end);

      return !(endMin <= itemStartMin || startMin >= itemEndMin);
    });
  }

  function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBand}>
        <Text style={styles.appTitle}>🌷 Activity Planner</Text>
      </View>

      <View style={styles.segControl}>
        <TouchableOpacity style={[styles.segBtn, viewMode === 'classes' && styles.segActive]} onPress={() => setViewMode('classes')}>
          <Ionicons name="calendar-outline" size={15} color={viewMode === 'classes' ? PINK.primary : PINK.sub} />
          <Text style={[styles.segText, viewMode === 'classes' && styles.segTextActive]}>กิจกรรม</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.segBtn, viewMode === 'study' && styles.segActive]} onPress={() => setViewMode('study')}>
          <Ionicons name="book-outline" size={15} color={viewMode === 'study' ? PINK.primary : PINK.sub} />
          <Text style={[styles.segText, viewMode === 'study' && styles.segTextActive]}>แผนการเรียน</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {viewMode === 'classes' ? (
          <FlatList
            data={days}
            keyExtractor={d => d}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const items = activities.filter(i => i.day === item);
              return (
                <View style={styles.dayBlock}>
                  <View style={[styles.dayHeader, { backgroundColor: dayColors[item] || PINK.light }]}>
                    <Text style={styles.dayEmoji}>{dayEmoji[item]}</Text>
                    <Text style={styles.dayTitle}>{dayNames[item]}</Text>
                    <View style={styles.dayBadge}>
                      <Text style={styles.dayBadgeText}>{items.length}</Text>
                    </View>
                  </View>

                  {items.length === 0 ? (
                    <Text style={styles.emptyDay}>ไม่มีกิจกรรม</Text>
                  ) : (
                    items.map(it => (
                      <View key={it.id} style={styles.classRow}>
                        <View style={styles.classRowLeft}>
                          <Text style={styles.classRowName}>{it.name}</Text>

                          <View style={styles.classTagRow}>
                            <View style={styles.tag}>
                              <Text style={styles.tagText}>🕐 {it.start}–{it.end}</Text>
                            </View>

                            {it.room ? (
                              <View style={styles.tag}>
                                <Text style={styles.tagText}>📍 {it.room}</Text>
                              </View>
                            ) : null}
                          </View>
                        </View>

                        <View style={styles.actionBtns}>
                          <TouchableOpacity onPress={() => openEdit(it)} style={styles.editBtn}>
                            <Ionicons name="pencil" size={14} color={PINK.primary} />
                          </TouchableOpacity>

                          <TouchableOpacity onPress={() => remove(it)} style={styles.delBtn}>
                            <Ionicons name="trash" size={14} color="#e05070" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              );
            }}
          />

        ) : (
          <>
            {plans.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>💭</Text>
                <Text style={styles.emptyTitle}>ยังไม่มีแผนการเรียน</Text>
                <Text style={styles.emptySub}>กด + เพื่อเพิ่มแผน</Text>
              </View>
            ) : (
              <FlatList
                data={plans}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.planCard}>

                    <TouchableOpacity
                      onPress={() => togglePlan(item.id)}
                      style={[
                        styles.checkbox,
                        item.checked && styles.checkboxChecked
                      ]}
                    >
                      {item.checked && <Text style={{ color: '#fff' }}>✓</Text>}
                    </TouchableOpacity>

                    <View style={styles.planLeft}>
                      <View style={styles.planDot} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.planSubject}>{item.subject}</Text>
                      <Text style={styles.planTopic}>{item.topic}</Text>
                      <Text style={styles.planDetail}>
                        {item.date} · {item.time}
                      </Text>
                    </View>

                    <View style={styles.actionBtns}>
                      <TouchableOpacity
                        onPress={() => openEditPlan(item)}
                        style={styles.editBtn}
                      >
                        <Ionicons name="pencil" size={14} color={PINK.primary} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => deletePlan(item.id)}
                        style={styles.delBtn}
                      >
                        <Ionicons name="trash" size={14} color="#e05070" />
                      </TouchableOpacity>
                    </View>

                  </View>
                )}
              />
            )}
          </>
        )}
      </View>

      <TouchableOpacity style={styles.fab} onPress={() => {
        if (viewMode === 'classes') openAdd();
        else { setEditingPlanId(null); setSubject(''); setTopic(''); setDate(''); setTime(''); setPlanModalVisible(true); }
      }}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Activity Modal */}
      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{editingId ? '✏️ แก้ไขกิจกรรม' : '🌷 เพิ่มกิจกรรม'}</Text>
            <TextInput placeholder="ชื่อกิจกรรม" value={name} onChangeText={setName} style={styles.input} placeholderTextColor="#cca0bb" />
            <TextInput placeholder="สถานที่" value={room} onChangeText={setRoom} style={styles.input} placeholderTextColor="#cca0bb" />
            <View style={styles.pickerWrap}>
              <Picker selectedValue={day} onValueChange={v => setDay(v)}>
                {days.map(d => <Picker.Item key={d} label={dayNames[d]} value={d} />)}
              </Picker>
            </View>
            <View style={styles.rowInputs}>
              <TextInput placeholder="วันที่ (1-31)" value={classDate} onChangeText={setClassDate} keyboardType="number-pad" style={[styles.input, { flex: 1, marginRight: 6 }]} placeholderTextColor="#cca0bb" />
              <TextInput placeholder="เดือน" value={classMonth} onChangeText={setClassMonth} style={[styles.input, { flex: 1 }]} placeholderTextColor="#cca0bb" />
            </View>
            <View style={styles.rowInputs}>
              <TextInput value={start} onChangeText={setStart} style={[styles.input, { flex: 1, marginRight: 6 }]} />
              <TextInput value={end} onChangeText={setEnd} style={[styles.input, { flex: 1 }]} />
            </View>
            <View style={styles.modalBtns}>
              <Pressable style={[styles.modalBtn, styles.cancelBtn]} onPress={() => { setModalVisible(false); setEditingId(null); }}>
                <Text style={styles.cancelBtnText}>ยกเลิก</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.saveBtn]} onPress={addActivity}>
                <Text style={styles.saveBtnText}>บันทึก</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Study Plan Modal */}
      <Modal visible={planModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{editingPlanId ? '✏️ แก้ไขแผนการเรียน' : '📚 เพิ่มแผนการเรียน'}</Text>
            <TextInput placeholder="ชื่อวิชา" style={styles.input} value={subject} onChangeText={setSubject} placeholderTextColor="#cca0bb" />
            <TextInput placeholder="หัวข้อที่อ่าน" style={styles.input} value={topic} onChangeText={setTopic} placeholderTextColor="#cca0bb" />
            <TextInput placeholder="วันที่ (เช่น 10/03/2026)" style={styles.input} value={date} onChangeText={setDate} placeholderTextColor="#cca0bb" />
            <TextInput placeholder="เวลา (เช่น 18:00 - 20:00)" style={styles.input} value={time} onChangeText={setTime} placeholderTextColor="#cca0bb" />
            <View style={styles.modalBtns}>
              <Pressable style={[styles.modalBtn, styles.cancelBtn]} onPress={() => { setPlanModalVisible(false); setEditingPlanId(null); }}>
                <Text style={styles.cancelBtnText}>ยกเลิก</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.saveBtn]} onPress={addPlan}>
                <Text style={styles.saveBtnText}>บันทึก</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PINK.bg },
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
    marginBottom: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },

  checkboxChecked: {
    backgroundColor: '#d4609a',
    borderColor: '#d4609a'
  },
  appTitle: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  segControl: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: PINK.border,
  },
  segBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 10,
  },
  segActive: { backgroundColor: PINK.light },
  segText: { fontSize: 13, fontWeight: '600', color: PINK.sub },
  segTextActive: { color: PINK.primary },
  dayBlock: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PINK.border,
    shadowColor: PINK.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
  },
  dayEmoji: { fontSize: 18 },
  dayTitle: { fontWeight: '700', fontSize: 14, color: PINK.text, flex: 1 },
  dayBadge: {
    backgroundColor: 'rgba(212,96,154,0.15)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  dayBadgeText: { fontSize: 11, fontWeight: '700', color: PINK.primary },
  emptyDay: { padding: 12, fontSize: 12, color: '#ccc', textAlign: 'center' },
  classRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: PINK.border,
    borderLeftWidth: 3,
    borderLeftColor: PINK.medium,
  },
  classRowLeft: { flex: 1 },
  classRowName: { fontWeight: '700', fontSize: 13, color: PINK.text },
  classTagRow: { flexDirection: 'row', gap: 6, marginTop: 5 },
  tag: { backgroundColor: PINK.light, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 10, color: PINK.dark, fontWeight: '600' },
  actionBtns: { flexDirection: 'row', gap: 8 },
  editBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: PINK.light,
    alignItems: 'center', justifyContent: 'center',
  },
  delBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#ffe8ef',
    alignItems: 'center', justifyContent: 'center',
  },
  emptyCard: {
    margin: 10, padding: 24, borderRadius: 14,
    borderWidth: 1, borderColor: PINK.border,
    backgroundColor: '#fff', alignItems: 'center',
  },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: PINK.text },
  emptySub: { marginTop: 4, fontSize: 12, color: PINK.sub },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: PINK.border,
    shadowColor: PINK.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  planLeft: { alignItems: 'center', paddingTop: 4 },
  planDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: PINK.primary,
  },
  planSubject: { fontWeight: '700', fontSize: 14, color: PINK.text },
  planTopic: { fontSize: 12, color: PINK.sub, marginTop: 2 },
  planDetail: { fontSize: 11, color: '#b0b0b0', marginTop: 3 },
  fab: {
    position: 'absolute', right: 18, bottom: 88,
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: PINK.primary,
    alignItems: 'center', justifyContent: 'center',
    elevation: 6,
    shadowColor: PINK.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#e0c0d0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: PINK.text, marginBottom: 12 },
  input: {
    borderWidth: 1.5, borderColor: PINK.border,
    padding: 10, borderRadius: 10,
    marginVertical: 5, backgroundColor: PINK.bg,
    color: PINK.text, fontSize: 14,
  },
  pickerWrap: {
    borderWidth: 1.5, borderColor: PINK.border,
    borderRadius: 10, overflow: 'hidden',
    marginVertical: 5, backgroundColor: '#fff',
  },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
  modalBtns: { flexDirection: 'row', marginTop: 14, gap: 10 },
  modalBtn: { flex: 1, padding: 13, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f3eaf0' },
  saveBtn: { backgroundColor: PINK.primary },
  cancelBtnText: { color: PINK.sub, fontWeight: '700' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
});