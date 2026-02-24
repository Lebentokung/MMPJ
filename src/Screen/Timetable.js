import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, Modal, Pressable, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const STORAGE_KEY = 'timetable';
const EXAMS_KEY = 'exams';

export default function Timetable(){
  const [list, setList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [room, setRoom] = useState('');
  const [day, setDay] = useState('Mon');
  const [classDate, setClassDate] = useState('');
  const [classMonth, setClassMonth] = useState('');
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('10:00');

  const [viewMode, setViewMode] = useState('classes');

  const [exams, setExams] = useState([]);
  const [examModalVisible, setExamModalVisible] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examDate, setExamDate] = useState('Mon');
  const [examDayOfMonth, setExamDayOfMonth] = useState('');
  const [examMonth, setExamMonth] = useState('');
  const [examStart, setExamStart] = useState('09:00');
  const [examEnd, setExamEnd] = useState('10:00');
  const [examLocation, setExamLocation] = useState('');
  const [editingExamId, setEditingExamId] = useState(null);

  useEffect(()=>{ load(); }, []);

  async function load(){
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    setList(raw? JSON.parse(raw) : []);
    const rawEx = await AsyncStorage.getItem(EXAMS_KEY);
    setExams(rawEx? JSON.parse(rawEx) : []);
  }

  async function save(newList){
    setList(newList);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
  }

  async function saveExams(newList){
    setExams(newList);
    await AsyncStorage.setItem(EXAMS_KEY, JSON.stringify(newList));
  }

  function openAdd(){
    setEditingId(null);
    setName(''); setCode(''); setRoom(''); setDay('Mon'); setClassDate(''); setClassMonth(''); setStart('09:00'); setEnd('10:00');
    setModalVisible(true);
  }

  function openEdit(item){
    setEditingId(item.id);
    setName(item.name||''); setCode(item.code||''); setRoom(item.room||''); setDay(item.day||'Mon'); setClassDate(item.classDate||''); setClassMonth(item.classMonth||''); setStart(item.start||'09:00'); setEnd(item.end||'10:00');
    setModalVisible(true);
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
    
    if (hasTimeConflict(day, start, end, editingId)) {
      return Alert.alert('Time Conflict', 'This time slot overlaps with another class on ' + day);
    }
    
    if (editingId){
      const newList = list.map(it=> it.id===editingId ? {...it, name, code, room, day, classDate, classMonth, start, end} : it);
      save(newList);
      setEditingId(null);
    } else {
      const item = {id: Date.now().toString(), name, code, room, day, classDate, classMonth, start, end};
      save([item, ...list]);
    }
    setModalVisible(false);
  }

  function openAddExam(){
    setEditingExamId(null);
    setExamTitle(''); setExamDate('Mon'); setExamDayOfMonth(''); setExamMonth(''); setExamStart('09:00'); setExamEnd('10:00'); setExamLocation('');
    setExamModalVisible(true);
  }

  function openEditExam(ex){
    setEditingExamId(ex.id);
    setExamTitle(ex.title||''); setExamDate(ex.date||'Mon'); setExamDayOfMonth(ex.examDayOfMonth||''); setExamMonth(ex.examMonth||''); setExamStart(ex.start||'09:00'); setExamEnd(ex.end||'10:00'); setExamLocation(ex.location||'');
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

  function addExam(){
    if (!examTitle.trim()) return Alert.alert('Please add an exam title');

    if (hasExamTimeConflict(examDate, examDayOfMonth, examMonth, examStart, examEnd, editingExamId)) {
      return Alert.alert('Time Conflict', 'This exam time overlaps with another exam on ' + examDate);
    }
    
    if (editingExamId){
      const newList = exams.map(it=> it.id===editingExamId ? {...it, title: examTitle, date: examDate, examDayOfMonth, examMonth, start: examStart, end: examEnd, location: examLocation} : it);
      saveExams(newList);
      setEditingExamId(null);
    } else {
      const item = {id: Date.now().toString(), title: examTitle, date: examDate, examDayOfMonth, examMonth, start: examStart, end: examEnd, location: examLocation};
      saveExams([item, ...exams]);
    }
    setExamModalVisible(false);
  }

  function remove(id){
    Alert.alert('Delete','Remove this class?', [{text:'Cancel'},{text:'OK', onPress: ()=> save(list.filter(i=>i.id!==id))}]);
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
        <View style={styles.segControl}>
          <TouchableOpacity style={[styles.segBtn, viewMode==='classes' && styles.segActive]} onPress={()=>setViewMode('classes')}><Text style={viewMode==='classes'?{fontWeight:'700'}:{}}>{'Timetable'}</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.segBtn, viewMode==='exams' && styles.segActive]} onPress={()=>setViewMode('exams')}><Text style={viewMode==='exams'?{fontWeight:'700'}:{}}>{'Exams'}</Text></TouchableOpacity>
        </View>

        {viewMode==='classes' ? (
          <>
            <Text style={{fontWeight:'700', marginVertical:8}}>Weekly View</Text>
            <FlatList data={days} keyExtractor={d=>d} renderItem={({item})=>{
              const items = list.filter(i=>i.day===item);
              return (
                <View style={styles.dayBlock}>
                  <Text style={styles.dayTitle}>{dayNames[item]}</Text>
                  {items.length===0 ? <Text style={{opacity:0.6}}>No classes</Text> : items.map(it=> (
                    <View key={it.id} style={styles.classRow}>
                      <View>
                        <Text style={{fontWeight:'600'}}>{it.name} ({it.code})</Text>
                        {(it.classDate || it.classMonth) ? <Text>{it.classDate || '-'} / {it.classMonth || '-'}</Text> : null}
                        <Text>{it.start} - {it.end} • {it.room}</Text>
                      </View>
                      <View style={{flexDirection:'row', alignItems:'center'}}>
                        <TouchableOpacity onPress={()=>openEdit(it)} style={[styles.rowBtn, {marginRight:8}]}><Text>Edit</Text></TouchableOpacity>
                        <TouchableOpacity onPress={()=>remove(it.id)} style={styles.del}><Text>Delete</Text></TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              );
            }} />
          </>
        ) : (
          <>
            <Text style={{fontWeight:'700', marginVertical:8}}>Exam Schedule</Text>
            <FlatList data={days} keyExtractor={d=>d} renderItem={({item})=>{
              const items = exams.filter(ex=> ex.date === item);
              return (
                <View style={styles.dayBlock}>
                  <Text style={styles.dayTitle}>{dayNames[item]}</Text>
                  {items.length===0 ? <Text style={{opacity:0.6}}>No exams</Text> : items.map(it=> (
                    <View key={it.id} style={styles.classRow}>
                      <View>
                        <Text style={{fontWeight:'600'}}>{it.title}</Text>
                        {(it.examDayOfMonth || it.examMonth) ? <Text>{it.examDayOfMonth || '-'} / {it.examMonth || '-'}</Text> : null}
                        <Text>{it.start} - {it.end} • {it.location}</Text>
                      </View>
                      <View style={{flexDirection:'row', alignItems:'center'}}>
                        <TouchableOpacity onPress={()=>openEditExam(it)} style={[styles.rowBtn, {marginRight:8}]}><Text>Edit</Text></TouchableOpacity>
                        <TouchableOpacity onPress={()=>removeExam(it.id)} style={styles.del}><Text>Delete</Text></TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              );
            }} />
          </>
        )}
      </View>

      <TouchableOpacity style={styles.fab} onPress={()=> viewMode==='classes' ? openAdd() : openAddExam()} accessibilityLabel="Add">
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={()=>setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{fontWeight:'700', marginBottom:8}}>{editingId? 'Edit Class' : 'Add Class'}</Text>
            <TextInput placeholder="Subject name" value={name} onChangeText={setName} style={styles.input} />
            <TextInput placeholder="Code" value={code} onChangeText={setCode} style={styles.input} />
            <TextInput placeholder="Room" value={room} onChangeText={setRoom} style={styles.input} />

            <View style={{borderWidth:1, borderColor:'#eee', borderRadius:6, overflow:'hidden', marginVertical:6}}>
              <Picker selectedValue={day} onValueChange={v=>setDay(v)}>
                <Picker.Item label="Monday" value="Mon" />
                <Picker.Item label="Tuesday" value="Tue" />
                <Picker.Item label="Wednesday" value="Wed" />
                <Picker.Item label="Thursday" value="Thu" />
                <Picker.Item label="Friday" value="Fri" />
                <Picker.Item label="Saturday" value="Sat" />
                <Picker.Item label="Sunday" value="Sun" />
              </Picker>
            </View>

            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
              <TextInput
                placeholder="Date (1-31)"
                value={classDate}
                onChangeText={setClassDate}
                keyboardType="number-pad"
                style={[styles.input,{flex:1, marginRight:6}]}
              />
              <TextInput
                placeholder="Month"
                value={classMonth}
                onChangeText={setClassMonth}
                style={[styles.input,{flex:1}]}
              />
            </View>

            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
              <TextInput value={start} onChangeText={setStart} style={[styles.input,{flex:1, marginRight:6}]} />
              <TextInput value={end} onChangeText={setEnd} style={[styles.input,{flex:1}]} />
            </View>

            <View style={{flexDirection:'row', marginTop:12}}>
              <Pressable style={[styles.modalBtn, {backgroundColor:'#ccc'}]} onPress={()=>{setModalVisible(false); setEditingId(null);}}>
                <Text>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, {backgroundColor:'#b96aa2'}]} onPress={addClass}>
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
        onRequestClose={()=>{setExamModalVisible(false); setEditingExamId(null);}}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{fontWeight:'700', marginBottom:8}}>{editingExamId? 'Edit Exam' : 'Add Exam'}</Text>
            <TextInput placeholder="Title" value={examTitle} onChangeText={setExamTitle} style={styles.input} />
            <TextInput placeholder="Location" value={examLocation} onChangeText={setExamLocation} style={styles.input} />

            <View style={{borderWidth:1, borderColor:'#eee', borderRadius:6, overflow:'hidden', marginVertical:6}}>
              <Picker selectedValue={examDate} onValueChange={v=>setExamDate(v)}>
                <Picker.Item label="Monday" value="Mon" />
                <Picker.Item label="Tuesday" value="Tue" />
                <Picker.Item label="Wednesday" value="Wed" />
                <Picker.Item label="Thursday" value="Thu" />
                <Picker.Item label="Friday" value="Fri" />
                <Picker.Item label="Saturday" value="Sat" />
                <Picker.Item label="Sunday" value="Sun" />
              </Picker>
            </View>

            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
              <TextInput
                placeholder="Date (1-31)"
                value={examDayOfMonth}
                onChangeText={setExamDayOfMonth}
                keyboardType="number-pad"
                style={[styles.input,{flex:1, marginRight:6}]}
              />
              <TextInput
                placeholder="Month"
                value={examMonth}
                onChangeText={setExamMonth}
                style={[styles.input,{flex:1}]}
              />
            </View>

            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
              <TextInput value={examStart} onChangeText={setExamStart} style={[styles.input,{flex:1, marginRight:6}]} />
              <TextInput value={examEnd} onChangeText={setExamEnd} style={[styles.input,{flex:1}]} />
            </View>

            <View style={{flexDirection:'row', marginTop:12}}>
              <Pressable style={[styles.modalBtn, {backgroundColor:'#ccc'}]} onPress={()=>{setExamModalVisible(false); setEditingExamId(null);}}>
                <Text>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, {backgroundColor:'#b96aa2'}]} onPress={addExam}>
                <Text style={{color:'#fff'}}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1, padding:16, backgroundColor:'#fff4fb'},
  header:{fontSize:18, fontWeight:'700', textAlign:'center'},
  input:{borderWidth:1, borderColor:'#eee', padding:8, borderRadius:6, marginVertical:6, backgroundColor:'#fff'},
  dayBlock:{paddingVertical:8, borderBottomWidth:1, borderColor:'#f0dff0'},
  dayTitle:{fontWeight:'700', marginBottom:6},
  classRow:{flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:6},
  del:{padding:6},
  fab:{position:'absolute', right:18, bottom:88, width:56, height:56, borderRadius:28, backgroundColor:'#d184b8', alignItems:'center', justifyContent:'center', elevation:4, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.2, shadowRadius:4},
  fabText:{color:'#fff', fontSize:28, lineHeight:30},
  modalOverlay:{flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'flex-end'},
  modalContent:{backgroundColor:'#fff', padding:16, borderTopLeftRadius:12, borderTopRightRadius:12},
  modalBtn:{flex:1, padding:12, borderRadius:8, alignItems:'center', marginHorizontal:6}
  ,segControl:{flexDirection:'row', backgroundColor:'#fff', borderRadius:8, overflow:'hidden', marginVertical:8}
  ,segBtn:{flex:1, padding:10, alignItems:'center'}
  ,segActive:{backgroundColor:'#f2d7ec'}
  ,examRow:{flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:10, borderBottomWidth:1, borderColor:'#f6e6f1'}
  ,rowBtn:{padding:6}
});
