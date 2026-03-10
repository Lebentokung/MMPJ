import React, {useContext, useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, Pressable} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Usercontext } from '../context/Usercontext';

export default function Timetable(){
  const { timetable, exams, saveTimetable, saveExams } = useContext(Usercontext);
  const [list, setList] = useState(timetable);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [room, setRoom] = useState('');
  const [day, setDay] = useState('Mon');
  const [selectedDays, setSelectedDays] = useState(['Mon']);
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

  React.useEffect(() => {
    setList(timetable);
  }, [timetable]);

  function openAdd(){
    setEditingId(null);
    setName(''); setCode(''); setRoom(''); setDay('Mon'); setStart('09:00'); setEnd('10:00');
    setSelectedDays(['Mon']);
    setModalVisible(true);
  }

  function openEdit(item){
    setEditingId(item.id);
    setName(item.name||''); setCode(item.code||''); setRoom(item.room||''); setDay(item.day||'Mon'); setStart(item.start||'09:00'); setEnd(item.end||'10:00');
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

  function addClass(){
    if (!name.trim()) return Alert.alert('Please add a subject name');

    if (editingId) {
      const hasClassConflict = hasTimeConflict(day, start, end, editingId);
      if (hasClassConflict) {
        return Alert.alert('เวลาใช้งานซ้ำ', 'วันเดียวกันไม่สามารถลงเวลาซ้ำกันได้ กรุณาเลือกเวลาใหม่');
      }

      const newList = list.map(it=> it.id===editingId ? {...it, name, code, room, day, start, end} : it);
      saveTimetable(newList);
      setEditingId(null);
      setModalVisible(false);
      return;
    }

    const daysToAdd = selectedDays.length ? selectedDays : [day];
    const conflictDays = daysToAdd.filter(selectedDay => hasTimeConflict(selectedDay, start, end));

    if (conflictDays.length > 0) {
      return Alert.alert('เวลาใช้งานซ้ำ', 'วันเดียวกันไม่สามารถลงเวลาซ้ำกันได้ กรุณาเลือกเวลาใหม่');
    }

    const now = Date.now();
    const newItems = daysToAdd.map((selectedDay, index) => ({
      id: `${now}-${index}`,
      name,
      code,
      room,
      day: selectedDay,
      start,
      end,
    }));

    saveTimetable([...newItems, ...list]);
    setModalVisible(false);
  }

  function openAddExam(){
    setEditingExamId(null);
    setExamTitle(''); setExamDate('Mon'); setExamDayOfMonth(''); setExamMonth(''); setExamStart('09:00'); setExamEnd('10:00'); setExamLocation(''); setExamSubjectId('');
    setExamModalVisible(true);
  }

  function openEditExam(ex){
    setEditingExamId(ex.id);
    setExamTitle(ex.title||''); setExamDate(ex.date||'Mon'); setExamDayOfMonth(ex.examDayOfMonth||''); setExamMonth(ex.examMonth||''); setExamStart(ex.start||'09:00'); setExamEnd(ex.end||'10:00'); setExamLocation(ex.location||'');
    setExamSubjectId(ex.subjectId || '');
    setExamModalVisible(true);
  }

  function hasExamTimeConflict(dateStr, dayOfMonth, month, startTime, endTime, excludeId = null) {
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);
    
    return exams.some(item => {
      const isSameDate =
        item.date === dateStr &&
        (item.examDayOfMonth || '') === dayOfMonth &&
        (item.examMonth || '') === month;

      const isLegacySameDate =
        item.date === dateStr &&
        !item.examDayOfMonth &&
        !item.examMonth &&
        !dayOfMonth &&
        !month;

      if (!isSameDate && !isLegacySameDate) return false;
      if (excludeId && item.id === excludeId) return false;
      
      const itemStartMin = timeToMinutes(item.start);
      const itemEndMin = timeToMinutes(item.end);
      
      // Check if times overlap
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

  function addExam(){
    if (!examTitle.trim()) return Alert.alert('Please add an exam title');

    const hasExamConflict = hasExamTimeConflict(examDate, examDayOfMonth, examMonth, examStart, examEnd, editingExamId);
    const hasClassConflict = hasActivityOverlapWithClasses(examDate, examStart, examEnd);

    if (hasExamConflict || hasClassConflict) {
      return Alert.alert('เวลาใช้งานซ้ำ', 'เวลานี้ทับกับกิจกรรมที่มีอยู่แล้ว กรุณาเลือกเวลาใหม่');
    }
    
    if (editingExamId){
      const linkedClass = list.find(it => it.id === examSubjectId);
      const newList = exams.map(it=> it.id===editingExamId ? {
        ...it,
        title: examTitle,
        date: examDate,
        examDayOfMonth,
        examMonth,
        start: examStart,
        end: examEnd,
        location: examLocation,
        subjectId: examSubjectId || '',
        subjectName: linkedClass?.name || '',
      } : it);
      saveExams(newList);
      setEditingExamId(null);
    } else {
      const linkedClass = list.find(it => it.id === examSubjectId);
      const item = {
        id: Date.now().toString(),
        title: examTitle,
        date: examDate,
        examDayOfMonth,
        examMonth,
        start: examStart,
        end: examEnd,
        location: examLocation,
        subjectId: examSubjectId || '',
        subjectName: linkedClass?.name || '',
      };
      saveExams([item, ...exams]);
    }
    setExamModalVisible(false);
  }

  function normalizeText(value) {
    return (value || '').trim().toLowerCase();
  }

  function isExamLinkedToClass(exam, classItem) {
    if (exam.subjectId && exam.subjectId === classItem.id) return true;

    const className = normalizeText(classItem.name);
    const examSubjectName = normalizeText(exam.subjectName);
    const examTitleName = normalizeText(exam.title);

    return className && (examSubjectName === className || examTitleName === className);
  }

  function remove(classItem){
    Alert.alert('Delete','Remove this class?', [{text:'Cancel'},{
      text:'OK',
      onPress: ()=> {
        const filteredClasses = list.filter(i => i.id !== classItem.id);
        const filteredExams = exams.filter(ex => !isExamLinkedToClass(ex, classItem));
        saveTimetable(filteredClasses);
        if (filteredExams.length !== exams.length) {
          saveExams(filteredExams);
        }
      }
    }]);
  }

  function removeExam(id){
    Alert.alert('Delete','Remove this exam?', [{text:'Cancel'},{text:'OK', onPress: ()=> saveExams(exams.filter(i=>i.id!==id))}]);
  }

  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const dayNames = {
    'Mon': 'Monday',
    'Tue': 'Tuesday',
    'Wed': 'Wednesday',
    'Thu': 'Thursday',
    'Fri': 'Friday',
    'Sat': 'Saturday',
    'Sun': 'Sunday'
  };

  return (
  <View style={styles.container}>
    <Text style={styles.header}>Timetable</Text>

    <View style={{flex:1}}>

      {/* Seg Control */}
      <View style={styles.segControl}>
        <TouchableOpacity
          style={[styles.segBtn, viewMode==='classes' && styles.segActive]}
          onPress={()=>setViewMode('classes')}
        >
          <Text style={viewMode==='classes'?{fontWeight:'700',color:'#fff'}:{}}>
            Timetable
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segBtn, viewMode==='exams' && styles.segActive]}
          onPress={()=>setViewMode('exams')}
        >
          <Text style={viewMode==='exams'?{fontWeight:'700',color:'#fff'}:{}}>
            Exams
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode==='classes' ? (
        <>
          <Text style={{fontWeight:'700', marginVertical:8}}>
            Weekly View
          </Text>

          {/* Scroll เฉพาะ Monday-Sunday */}
          <ScrollView
            style={{flex:1}}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom:120}}
          >

            {days.map(item=>{
              const items = list.filter(i=>i.day===item)

              return(
                <View key={item} style={styles.dayBlock}>
                  <Text style={styles.dayTitle}>{dayNames[item]}</Text>

                  {items.length===0 ? (
                    <Text style={{opacity:0.6}}>No classes</Text>
                  ) : (
                    items.map(it=>(
                      <View key={it.id} style={styles.classCard}>
                        <View>
                          <Text style={{fontWeight:'600'}}>
                            {it.name} ({it.code})
                          </Text>

                          <Text>
                            {it.start} - {it.end} • {it.room}
                          </Text>
                        </View>

                        <View style={{flexDirection:'row',alignItems:'center'}}>
                          <TouchableOpacity
                            onPress={()=>openEdit(it)}
                            style={[styles.rowBtn,{marginRight:8}]}
                          >
                            <Text>Edit</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={()=>remove(it)}
                            style={styles.del}
                          >
                            <Text>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              )
            })}

            {list.length===0 && (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>ไม่มีข้อมูล</Text>
                <Text style={styles.emptySub}>
                  Empty timetable. กด + เพื่อเพิ่มวิชาเรียน
                </Text>
              </View>
            )}

          </ScrollView>
        </>
      ) : (
        <>
          <Text style={{fontWeight:'700', marginVertical:8}}>
            Exam Schedule
          </Text>

          {/* Scroll เฉพาะ Monday-Sunday */}
          <ScrollView
            style={{flex:1}}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom:120}}
          >

            {days.map(item=>{
              const items = exams.filter(ex=>ex.date===item)

              return(
                <View key={item} style={styles.dayBlock}>
                  <Text style={styles.dayTitle}>{dayNames[item]}</Text>

                  {items.length===0 ? (
                    <Text style={{opacity:0.6}}>No exams</Text>
                  ) : (
                    items.map(it=>(
                      <View key={it.id} style={styles.classCard}>
                        <View>
                          <Text style={{fontWeight:'600'}}>
                            {it.title}
                          </Text>

                          {(it.examDayOfMonth || it.examMonth) &&
                            <Text>
                              {it.examDayOfMonth || '-'} / {it.examMonth || '-'}
                            </Text>
                          }

                          <Text>
                            {it.start} - {it.end} • {it.location}
                          </Text>
                        </View>

                        <View style={{flexDirection:'row',alignItems:'center'}}>
                          <TouchableOpacity
                            onPress={()=>openEditExam(it)}
                            style={[styles.rowBtn,{marginRight:8}]}
                          >
                            <Text>Edit</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={()=>removeExam(it.id)}
                            style={styles.del}
                          >
                            <Text>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              )
            })}

            {exams.length===0 && (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>ไม่มีข้อมูล</Text>
                <Text style={styles.emptySub}>
                  Empty exam schedule. กด + เพื่อเพิ่มตารางสอบ
                </Text>
              </View>
            )}

          </ScrollView>
        </>
      )}

    </View>

    {/* Floating + button */}
    <TouchableOpacity
      style={styles.fab}
      onPress={()=> viewMode==='classes' ? openAdd() : openAddExam()}
      accessibilityLabel="Add"
    >
      <Text style={styles.fabText}>+</Text>
    </TouchableOpacity>

   
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={()=>setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>

          <Text style={{fontWeight:'700', marginBottom:8}}>
            {editingId? 'Edit Class' : 'Add Class'}
          </Text>

          <TextInput placeholder="Subject name" value={name} onChangeText={setName} style={styles.input}/>
          <TextInput placeholder="Code" value={code} onChangeText={setCode} style={styles.input}/>
          <TextInput placeholder="Room" value={room} onChangeText={setRoom} style={styles.input}/>

          {editingId ? (
            <View style={{borderWidth:1,borderColor:'#eee',borderRadius:6,overflow:'hidden',marginVertical:6}}>
              <Picker selectedValue={day} onValueChange={v=>setDay(v)}>
                <Picker.Item label="Monday" value="Mon"/>
                <Picker.Item label="Tuesday" value="Tue"/>
                <Picker.Item label="Wednesday" value="Wed"/>
                <Picker.Item label="Thursday" value="Thu"/>
                <Picker.Item label="Friday" value="Fri"/>
                <Picker.Item label="Saturday" value="Sat"/>
                <Picker.Item label="Sunday" value="Sun"/>
              </Picker>
            </View>
          ) : (
            <View style={styles.multiDayWrap}>
              <Text style={styles.multiDayLabel}>Select days (multi-select)</Text>

              <View style={styles.dayChipRow}>
                {days.map(d=>{
                  const active = selectedDays.includes(d)

                  return(
                    <TouchableOpacity
                      key={d}
                      onPress={()=>toggleSelectedDay(d)}
                      style={[styles.dayChip, active && styles.dayChipActive]}
                    >
                      <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>
                        {d}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          )}

          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <TextInput value={start} onChangeText={setStart} style={[styles.input,{flex:1,marginRight:6}]}/>
            <TextInput value={end} onChangeText={setEnd} style={[styles.input,{flex:1}]}/>
          </View>

          <View style={{flexDirection:'row',marginTop:12}}>
            <Pressable style={[styles.modalBtn,{backgroundColor:'#ccc'}]} onPress={()=>{setModalVisible(false);setEditingId(null)}}>
              <Text>Cancel</Text>
            </Pressable>

            <Pressable style={[styles.modalBtn,{backgroundColor:'#b96aa2'}]} onPress={addClass}>
              <Text style={{color:'#fff'}}>Save</Text>
            </Pressable>
          </View>

        </View>
      </View>
    </Modal>

    
    <Modal
      animationType="slide"
      transparent={true}
      visible={examModalVisible}
      onRequestClose={()=>{setExamModalVisible(false);setEditingExamId(null)}}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>

          <Text style={{fontWeight:'700', marginBottom:8}}>
            {editingExamId? 'Edit Exam' : 'Add Exam'}
          </Text>

          <TextInput placeholder="Title" value={examTitle} onChangeText={setExamTitle} style={styles.input}/>
          <TextInput placeholder="Location" value={examLocation} onChangeText={setExamLocation} style={styles.input}/>

          <View style={{borderWidth:1,borderColor:'#eee',borderRadius:6,overflow:'hidden',marginVertical:6,backgroundColor:'#fff'}}>
            <Picker selectedValue={examSubjectId} onValueChange={v=>setExamSubjectId(v)}>
              <Picker.Item label="Not linked to subject" value=""/>
              {list.map(subject=>(
                <Picker.Item key={subject.id} label={subject.name} value={subject.id}/>
              ))}
            </Picker>
          </View>

          <View style={{borderWidth:1,borderColor:'#eee',borderRadius:6,overflow:'hidden',marginVertical:6}}>
            <Picker selectedValue={examDate} onValueChange={v=>setExamDate(v)}>
              <Picker.Item label="Monday" value="Mon"/>
              <Picker.Item label="Tuesday" value="Tue"/>
              <Picker.Item label="Wednesday" value="Wed"/>
              <Picker.Item label="Thursday" value="Thu"/>
              <Picker.Item label="Friday" value="Fri"/>
              <Picker.Item label="Saturday" value="Sat"/>
              <Picker.Item label="Sunday" value="Sun"/>
            </Picker>
          </View>

          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <TextInput
              placeholder="Date (1-31)"
              value={examDayOfMonth}
              onChangeText={setExamDayOfMonth}
              keyboardType="number-pad"
              style={[styles.input,{flex:1,marginRight:6}]}
            />
            <TextInput
              placeholder="Month"
              value={examMonth}
              onChangeText={setExamMonth}
              style={[styles.input,{flex:1}]}
            />
          </View>

          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <TextInput value={examStart} onChangeText={setExamStart} style={[styles.input,{flex:1,marginRight:6}]}/>
            <TextInput value={examEnd} onChangeText={setExamEnd} style={[styles.input,{flex:1}]}/>
          </View>

          <View style={{flexDirection:'row',marginTop:12}}>
            <Pressable style={[styles.modalBtn,{backgroundColor:'#ccc'}]} onPress={()=>{setExamModalVisible(false);setEditingExamId(null)}}>
              <Text>Cancel</Text>
            </Pressable>

            <Pressable style={[styles.modalBtn,{backgroundColor:'#b96aa2'}]} onPress={addExam}>
              <Text style={{color:'#fff'}}>Save</Text>
            </Pressable>
          </View>

        </View>
      </View>
    </Modal>

  </View>
)
}

const styles = StyleSheet.create({
  container:{flex:1, padding:16, backgroundColor:'#fff4fb'},
  header:{marginTop:32,marginBottom:16,fontSize:18, fontWeight:'700', textAlign:'center'},
  input:{borderWidth:1, borderColor:'#eee', padding:8, borderRadius:6, marginVertical:6, backgroundColor:'#fff'},
  dayBlock:{paddingVertical:8, borderBottomWidth:1, borderColor:'#f0dff0'},
  dayTitle:{fontWeight:'700', marginBottom:6},
  classRow:{flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:6},
  emptyCard:{marginTop:16, padding:14, borderRadius:10, borderWidth:1, borderColor:'#f0dff0', backgroundColor:'#fff', alignItems:'center'},
  emptyTitle:{fontSize:16, fontWeight:'700', color:'#6b3550'},
  emptySub:{marginTop:4, fontSize:13, color:'#7f6b78', textAlign:'center'},
  multiDayWrap:{marginVertical:6},
  multiDayLabel:{fontSize:12, color:'#6b3550', marginBottom:6},
  dayChipRow:{flexDirection:'row', flexWrap:'wrap'},
  dayChip:{paddingVertical:6, paddingHorizontal:10, borderRadius:14, borderWidth:1, borderColor:'#e8cde0', marginRight:8, marginBottom:8, backgroundColor:'#fff'},
  dayChipActive:{backgroundColor:'#b96aa2', borderColor:'#b96aa2'},
  dayChipText:{fontSize:12, color:'#6b3550', fontWeight:'600'},
  dayChipTextActive:{color:'#fff'},
  del:{padding:6},
  fab:{position:'absolute', right:18, bottom:88, width:56, height:56, borderRadius:28, backgroundColor:'#d184b8', alignItems:'center', justifyContent:'center', elevation:4, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.2, shadowRadius:4},
  fabText:{color:'#fff', fontSize:28, lineHeight:30},
  modalOverlay:{flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'flex-end'},
  modalContent:{backgroundColor:'#fff', padding:16, borderTopLeftRadius:12, borderTopRightRadius:12},
  modalBtn:{flex:1, padding:12, borderRadius:8, alignItems:'center', marginHorizontal:6}
  ,segControl:{flexDirection:'row', backgroundColor:'#fff', borderRadius:8, overflow:'hidden', marginVertical:8}
  ,segBtn:{flex:1, padding:10, alignItems:'center'}
  ,segActive:{backgroundColor:'#b96aa2'}
  ,examRow:{flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:10, borderBottomWidth:1, borderColor:'#f6e6f1'}
  ,rowBtn:{padding:6},
  classCard:{
  backgroundColor:"#f0dff0",
  borderRadius:12,
  padding:12,
  marginVertical:3,
  flexDirection:"row",
  justifyContent:"space-between",
  alignItems:"center",
  elevation:1
}
});
