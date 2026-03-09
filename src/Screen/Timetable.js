import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, Modal, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { Usercontext } from '../context/Usercontext';

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

export default function Timetable() {
  const { timetable, exams, saveTimetable, saveExams } = useContext(Usercontext);
  const [list, setList] = useState(timetable);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [room, setRoom] = useState('');
  const [day, setDay] = useState('Mon');
  const [selectedDays, setSelectedDays] = useState(['Mon']);
  const [classDate, setClassDate] = useState('');
  const [classMonth, setClassMonth] = useState('');
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('10:00');
  const [viewMode, setViewMode] = useState('classes');

  const [examModalVisible, setExamModalVisible] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examDate, setExamDate] = useState('Mon');
  const [examDayOfMonth, setExamDayOfMonth] = useState('');
  const [examMonth, setExamMonth] = useState('');
  const [examStart, setExamStart] = useState('09:00');
  const [examEnd, setExamEnd] = useState('10:00');
  const [examLocation, setExamLocation] = useState('');
  const [examSubjectId, setExamSubjectId] = useState('');
  const [editingExamId, setEditingExamId] = useState(null);

  React.useEffect(() => { setList(timetable); }, [timetable]);

  function openAdd() {
    setEditingId(null);
    setName(''); setCode(''); setRoom(''); setDay('Mon');
    setClassDate(''); setClassMonth(''); setStart('09:00'); setEnd('10:00');
    setSelectedDays(['Mon']);
    setModalVisible(true);
  }

  function openEdit(item) {
    setEditingId(item.id);
    setName(item.name || ''); setCode(item.code || ''); setRoom(item.room || '');
    setDay(item.day || 'Mon'); setClassDate(item.classDate || '');
    setClassMonth(item.classMonth || ''); setStart(item.start || '09:00'); setEnd(item.end || '10:00');
    setSelectedDays([item.day || 'Mon']);
    setModalVisible(true);
  }

  function toggleSelectedDay(dayStr) {
    setSelectedDays(prev => {
      if (prev.includes(dayStr)) {
        if (prev.length === 1) return prev;
        return prev.filter(d => d !== dayStr);
      }
      return [...prev, dayStr];
    });
  }

  function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  function hasTimeConflict(dayStr, startTime, endTime, excludeId = null) {
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);
    return list.some(item => {
      if (item.day !== dayStr) return false;
      if (excludeId && item.id === excludeId) return false;
      const itemStartMin = timeToMinutes(item.start);
      const itemEndMin = timeToMinutes(item.end);
      return !(endMin <= itemStartMin || startMin >= itemEndMin);
    });
  }

  function addClass() {
    if (!name.trim()) return Alert.alert('กรุณาใส่ชื่อวิชา');
    if (editingId) {
      if (hasTimeConflict(day, start, end, editingId))
        return Alert.alert('เวลาซ้ำ', 'วันเดียวกันไม่สามารถลงเวลาซ้ำกันได้');
      const newList = list.map(it => it.id === editingId ? { ...it, name, code, room, day, classDate, classMonth, start, end } : it);
      saveTimetable(newList);
      setEditingId(null);
      setModalVisible(false);
      return;
    }
    const daysToAdd = selectedDays.length ? selectedDays : [day];
    const conflictDays = daysToAdd.filter(d => hasTimeConflict(d, start, end));
    if (conflictDays.length > 0) return Alert.alert('เวลาซ้ำ', 'วันเดียวกันไม่สามารถลงเวลาซ้ำกันได้');
    const now = Date.now();
    const newItems = daysToAdd.map((d, i) => ({ id: `${now}-${i}`, name, code, room, day: d, classDate, classMonth, start, end }));
    saveTimetable([...newItems, ...list]);
    setModalVisible(false);
  }

  function openAddExam() {
    setEditingExamId(null);
    setExamTitle(''); setExamDate('Mon'); setExamDayOfMonth(''); setExamMonth('');
    setExamStart('09:00'); setExamEnd('10:00'); setExamLocation(''); setExamSubjectId('');
    setExamModalVisible(true);
  }

  function openEditExam(ex) {
    setEditingExamId(ex.id);
    setExamTitle(ex.title || ''); setExamDate(ex.date || 'Mon');
    setExamDayOfMonth(ex.examDayOfMonth || ''); setExamMonth(ex.examMonth || '');
    setExamStart(ex.start || '09:00'); setExamEnd(ex.end || '10:00');
    setExamLocation(ex.location || ''); setExamSubjectId(ex.subjectId || '');
    setExamModalVisible(true);
  }

  function hasExamTimeConflict(dateStr, dayOfMonth, month, startTime, endTime, excludeId = null) {
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);
    return exams.some(item => {
      const isSameDate = item.date === dateStr && (item.examDayOfMonth || '') === dayOfMonth && (item.examMonth || '') === month;
      const isLegacySameDate = item.date === dateStr && !item.examDayOfMonth && !item.examMonth && !dayOfMonth && !month;
      if (!isSameDate && !isLegacySameDate) return false;
      if (excludeId && item.id === excludeId) return false;
      const itemStartMin = timeToMinutes(item.start);
      const itemEndMin = timeToMinutes(item.end);
      return !(endMin <= itemStartMin || startMin >= itemEndMin);
    });
  }

  function hasActivityOverlapWithClasses(dayStr, startTime, endTime, excludeClassId = null) {
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);
    return list.some(item => {
      if (item.day !== dayStr) return false;
      if (excludeClassId && item.id === excludeClassId) return false;
      const itemStartMin = timeToMinutes(item.start);
      const itemEndMin = timeToMinutes(item.end);
      return !(endMin <= itemStartMin || startMin >= itemEndMin);
    });
  }

  function addExam() {
    if (!examTitle.trim()) return Alert.alert('กรุณาใส่ชื่อสอบ');
    if (hasExamTimeConflict(examDate, examDayOfMonth, examMonth, examStart, examEnd, editingExamId) ||
        hasActivityOverlapWithClasses(examDate, examStart, examEnd))
      return Alert.alert('เวลาซ้ำ', 'เวลานี้ทับกับกิจกรรมที่มีอยู่');
    if (editingExamId) {
      const linkedClass = list.find(it => it.id === examSubjectId);
      const newList = exams.map(it => it.id === editingExamId ? {
        ...it, title: examTitle, date: examDate, examDayOfMonth, examMonth,
        start: examStart, end: examEnd, location: examLocation,
        subjectId: examSubjectId || '', subjectName: linkedClass?.name || '',
      } : it);
      saveExams(newList);
      setEditingExamId(null);
    } else {
      const linkedClass = list.find(it => it.id === examSubjectId);
      saveExams([{
        id: Date.now().toString(), title: examTitle, date: examDate, examDayOfMonth, examMonth,
        start: examStart, end: examEnd, location: examLocation,
        subjectId: examSubjectId || '', subjectName: linkedClass?.name || '',
      }, ...exams]);
    }
    setExamModalVisible(false);
  }

  function normalizeText(value) { return (value || '').trim().toLowerCase(); }

  function isExamLinkedToClass(exam, classItem) {
    if (exam.subjectId && exam.subjectId === classItem.id) return true;
    const className = normalizeText(classItem.name);
    const examSubjectName = normalizeText(exam.subjectName);
    const examTitleName = normalizeText(exam.title);
    return className && (examSubjectName === className || examTitleName === className);
  }

  function remove(classItem) {
    Alert.alert('ลบวิชา', 'ต้องการลบวิชานี้?', [{ text: 'ยกเลิก' }, {
      text: 'ลบ', style: 'destructive',
      onPress: () => {
        const filteredClasses = list.filter(i => i.id !== classItem.id);
        const filteredExams = exams.filter(ex => !isExamLinkedToClass(ex, classItem));
        saveTimetable(filteredClasses);
        if (filteredExams.length !== exams.length) saveExams(filteredExams);
      }
    }]);
  }

  function removeExam(id) {
    Alert.alert('ลบการสอบ', 'ต้องการลบรายการนี้?', [{ text: 'ยกเลิก' }, {
      text: 'ลบ', style: 'destructive',
      onPress: () => saveExams(exams.filter(i => i.id !== id))
    }]);
  }

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayNames = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
  const dayColors = { Mon: '#ffd6e8', Tue: '#fce0f5', Wed: '#f5d6ff', Thu: '#e8d6ff', Fri: '#d6e8ff', Sat: '#d6f5e8', Sun: '#fff0d6' };
  const dayEmoji = { Mon: '📚', Tue: '✏️', Wed: '🎨', Thu: '🔬', Fri: '🎵', Sat: '🌸', Sun: '☀️' };

  return (
    <View style={styles.container}>
      <View style={styles.headerBand}>
        <Text style={styles.appTitle}>📅 Timetable</Text>
      </View>

      <View style={styles.segControl}>
        <TouchableOpacity style={[styles.segBtn, viewMode === 'classes' && styles.segActive]} onPress={() => setViewMode('classes')}>
          <Ionicons name="book-outline" size={15} color={viewMode === 'classes' ? PINK.primary : PINK.sub} />
          <Text style={[styles.segText, viewMode === 'classes' && styles.segTextActive]}>ตารางเรียน</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.segBtn, viewMode === 'exams' && styles.segActive]} onPress={() => setViewMode('exams')}>
          <Ionicons name="document-text-outline" size={15} color={viewMode === 'exams' ? PINK.primary : PINK.sub} />
          <Text style={[styles.segText, viewMode === 'exams' && styles.segTextActive]}>ตารางสอบ</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {viewMode === 'classes' ? (
          <FlatList
            data={days}
            keyExtractor={d => d}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const items = list.filter(i => i.day === item);
              return (
                <View style={styles.dayBlock}>
                  <View style={[styles.dayHeader, { backgroundColor: dayColors[item] || PINK.light }]}>
                    <Text style={styles.dayEmoji}>{dayEmoji[item]}</Text>
                    <Text style={styles.dayTitle}>{dayNames[item]}</Text>
                    <View style={styles.dayBadge}><Text style={styles.dayBadgeText}>{items.length}</Text></View>
                  </View>
                  {items.length === 0 ? (
                    <Text style={styles.emptyDay}>ไม่มีคลาส</Text>
                  ) : (
                    items.map(it => (
                      <View key={it.id} style={styles.classRow}>
                        <View style={styles.classRowLeft}>
                          <Text style={styles.classRowName}>{it.name}</Text>
                          {it.code ? <Text style={styles.classRowCode}>{it.code}</Text> : null}
                          <View style={styles.classTagRow}>
                            <View style={styles.tag}><Text style={styles.tagText}>🕐 {it.start}–{it.end}</Text></View>
                            <View style={styles.tag}><Text style={styles.tagText}>📍 {it.room}</Text></View>
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
            ListFooterComponent={() =>
              list.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyEmoji}>🌸</Text>
                  <Text style={styles.emptyTitle}>ยังไม่มีตารางเรียน</Text>
                  <Text style={styles.emptySub}>กด + เพื่อเพิ่มวิชาเรียน</Text>
                </View>
              ) : null
            }
          />
        ) : (
          <FlatList
            data={days}
            keyExtractor={d => d}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const items = exams.filter(ex => ex.date === item);
              return (
                <View style={styles.dayBlock}>
                  <View style={[styles.dayHeader, { backgroundColor: dayColors[item] || PINK.light }]}>
                    <Text style={styles.dayEmoji}>{dayEmoji[item]}</Text>
                    <Text style={styles.dayTitle}>{dayNames[item]}</Text>
                    <View style={styles.dayBadge}><Text style={styles.dayBadgeText}>{items.length}</Text></View>
                  </View>
                  {items.length === 0 ? (
                    <Text style={styles.emptyDay}>ไม่มีการสอบ</Text>
                  ) : (
                    items.map(it => (
                      <View key={it.id} style={[styles.classRow, { borderLeftColor: '#e05070' }]}>
                        <View style={styles.classRowLeft}>
                          <Text style={styles.classRowName}>{it.title}</Text>
                          {(it.examDayOfMonth || it.examMonth) ? <Text style={styles.classRowCode}>{it.examDayOfMonth}/{it.examMonth}</Text> : null}
                          <View style={styles.classTagRow}>
                            <View style={styles.tag}><Text style={styles.tagText}>🕐 {it.start}–{it.end}</Text></View>
                            <View style={styles.tag}><Text style={styles.tagText}>📍 {it.location}</Text></View>
                          </View>
                        </View>
                        <View style={styles.actionBtns}>
                          <TouchableOpacity onPress={() => openEditExam(it)} style={styles.editBtn}>
                            <Ionicons name="pencil" size={14} color={PINK.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => removeExam(it.id)} style={styles.delBtn}>
                            <Ionicons name="trash" size={14} color="#e05070" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              );
            }}
            ListFooterComponent={() =>
              exams.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyEmoji}>🎀</Text>
                  <Text style={styles.emptyTitle}>ยังไม่มีตารางสอบ</Text>
                  <Text style={styles.emptySub}>กด + เพื่อเพิ่มตารางสอบ</Text>
                </View>
              ) : null
            }
          />
        )}
      </View>

      <TouchableOpacity style={styles.fab} onPress={() => viewMode === 'classes' ? openAdd() : openAddExam()}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add/Edit Class Modal */}
      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{editingId ? '✏️ แก้ไขวิชา' : '📚 เพิ่มวิชาเรียน'}</Text>
            <TextInput placeholder="ชื่อวิชา" value={name} onChangeText={setName} style={styles.input} placeholderTextColor="#cca0bb" />
            <TextInput placeholder="รหัสวิชา" value={code} onChangeText={setCode} style={styles.input} placeholderTextColor="#cca0bb" />
            <TextInput placeholder="ห้องเรียน" value={room} onChangeText={setRoom} style={styles.input} placeholderTextColor="#cca0bb" />
            {editingId ? (
              <View style={styles.pickerWrap}>
                <Picker selectedValue={day} onValueChange={v => setDay(v)}>
                  {days.map(d => <Picker.Item key={d} label={dayNames[d]} value={d} />)}
                </Picker>
              </View>
            ) : (
              <View style={styles.multiDayWrap}>
                <Text style={styles.multiDayLabel}>เลือกวัน (เลือกได้หลายวัน)</Text>
                <View style={styles.dayChipRow}>
                  {days.map(d => {
                    const active = selectedDays.includes(d);
                    return (
                      <TouchableOpacity key={d} onPress={() => toggleSelectedDay(d)} style={[styles.dayChip, active && styles.dayChipActive]}>
                        <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>{d}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
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
              <Pressable style={[styles.modalBtn, styles.saveBtn]} onPress={addClass}>
                <Text style={styles.saveBtnText}>บันทึก</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Exam Modal */}
      <Modal animationType="slide" transparent visible={examModalVisible} onRequestClose={() => { setExamModalVisible(false); setEditingExamId(null); }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{editingExamId ? '✏️ แก้ไขการสอบ' : '📝 เพิ่มตารางสอบ'}</Text>
            <TextInput placeholder="ชื่อวิชาสอบ" value={examTitle} onChangeText={setExamTitle} style={styles.input} placeholderTextColor="#cca0bb" />
            <TextInput placeholder="สถานที่สอบ" value={examLocation} onChangeText={setExamLocation} style={styles.input} placeholderTextColor="#cca0bb" />
            <View style={styles.pickerWrap}>
              <Picker selectedValue={examSubjectId} onValueChange={v => setExamSubjectId(v)}>
                <Picker.Item label="ไม่เชื่อมกับวิชา" value="" />
                {list.map(subject => <Picker.Item key={subject.id} label={subject.name} value={subject.id} />)}
              </Picker>
            </View>
            <View style={styles.pickerWrap}>
              <Picker selectedValue={examDate} onValueChange={v => setExamDate(v)}>
                {days.map(d => <Picker.Item key={d} label={dayNames[d]} value={d} />)}
              </Picker>
            </View>
            <View style={styles.rowInputs}>
              <TextInput placeholder="วันที่ (1-31)" value={examDayOfMonth} onChangeText={setExamDayOfMonth} keyboardType="number-pad" style={[styles.input, { flex: 1, marginRight: 6 }]} placeholderTextColor="#cca0bb" />
              <TextInput placeholder="เดือน" value={examMonth} onChangeText={setExamMonth} style={[styles.input, { flex: 1 }]} placeholderTextColor="#cca0bb" />
            </View>
            <View style={styles.rowInputs}>
              <TextInput value={examStart} onChangeText={setExamStart} style={[styles.input, { flex: 1, marginRight: 6 }]} />
              <TextInput value={examEnd} onChangeText={setExamEnd} style={[styles.input, { flex: 1 }]} />
            </View>
            <View style={styles.modalBtns}>
              <Pressable style={[styles.modalBtn, styles.cancelBtn]} onPress={() => { setExamModalVisible(false); setEditingExamId(null); }}>
                <Text style={styles.cancelBtnText}>ยกเลิก</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.saveBtn]} onPress={addExam}>
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
  classRowCode: { fontSize: 11, color: PINK.sub, marginTop: 1 },
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
    margin: 10, padding: 20, borderRadius: 14,
    borderWidth: 1, borderColor: PINK.border,
    backgroundColor: '#fff', alignItems: 'center',
  },
  emptyEmoji: { fontSize: 32, marginBottom: 6 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: PINK.text },
  emptySub: { marginTop: 4, fontSize: 12, color: PINK.sub, textAlign: 'center' },
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
  multiDayWrap: { marginVertical: 8 },
  multiDayLabel: { fontSize: 12, color: PINK.sub, marginBottom: 8, fontWeight: '600' },
  dayChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayChip: {
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 14,
    borderWidth: 1.5, borderColor: PINK.border, backgroundColor: '#fff',
  },
  dayChipActive: { backgroundColor: PINK.primary, borderColor: PINK.primary },
  dayChipText: { fontSize: 12, color: PINK.sub, fontWeight: '600' },
  dayChipTextActive: { color: '#fff' },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
  modalBtns: { flexDirection: 'row', marginTop: 14, gap: 10 },
  modalBtn: { flex: 1, padding: 13, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f3eaf0' },
  saveBtn: { backgroundColor: PINK.primary },
  cancelBtnText: { color: PINK.sub, fontWeight: '700' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
});
