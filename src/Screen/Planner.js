import React, {useContext, useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, Modal, Pressable} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Usercontext } from '../context/Usercontext';
import { StatusBar } from 'react-native';

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
        checked: false, // default unchecked
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

        <View style={{flexDirection:'row', alignItems:'center'}}>
          <TouchableOpacity
            onPress={() => togglePlan(item.id)}
            style={[styles.checkbox, item.checked && styles.checkboxChecked, {marginRight:8}]}
          >
            {item.checked && <Text style={{color:'#fff'}}>✓</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rowBtn,{marginRight:8}]}
            onPress={() => openEditPlan(item)}
          >
            <Text style={{color:'#000000'}}>Edit</Text>
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

  function openAdd(){
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

  function addActivity(){
      if (!name.trim()) return Alert.alert('Please add an activity name');
      
      const hasClassConflict = hasTimeConflict(day, start, end, editingId);
  
      if (hasClassConflict) {
        return Alert.alert('เวลาใช้งานซ้ำ', 'เวลานี้ทับกับกิจกรรมที่มีอยู่แล้ว กรุณาเลือกเวลาใหม่');
      }
      
      if (editingId){
        const newList = activities.map(it=> it.id===editingId ? {...it, name,  room, day, classDate, classMonth, start, end} : it);
        savePlannerActivities(newList);
        setEditingId(null);
      } else {
        const item = {id: Date.now().toString(), name,  room, day, classDate, classMonth, start, end};
        savePlannerActivities([item, ...activities]);
      }
      setModalVisible(false);
    }

  function openEdit(item){
    setEditingId(item.id);
    setName(item.name||''); setRoom(item.room||''); setDay(item.day||'Mon'); setClassDate(item.classDate||''); setClassMonth(item.classMonth||''); setStart(item.start||'09:00'); setEnd(item.end||'10:00');
    setModalVisible(true);
  }

  function remove(classItem){
      Alert.alert('Delete','Remove this class?', [{text:'Cancel'},{
        text:'OK',
        onPress: ()=> {
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

      <Text style={styles.header}>Activity Planner</Text>
        <View style={{flex:1}}>
          <View style={styles.segControl}>
            <TouchableOpacity style={[styles.segBtn, viewMode==='classes' && styles.segActive]} onPress={()=>setViewMode('classes')}><Text style={viewMode==='classes'?{fontWeight:'700'}:{}}>{'Activities'}</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.segBtn, viewMode==='study' && styles.segActive]} onPress={()=>setViewMode('study')}><Text style={viewMode==='study'?{fontWeight:'700'}:{}}>{'Study'}</Text></TouchableOpacity>
        </View>
        
                {viewMode==='classes' ? (
                  <>
                    <Text style={{fontWeight:'700', marginVertical:8}}>Weekly View</Text>
                    <FlatList data={days} keyExtractor={d=>d} renderItem={({item})=>{
                      const items = activities.filter(i=>i.day===item);
                      return (
                        <View style={styles.dayBlock}>
                          <Text style={styles.dayTitle}>{dayNames[item]}</Text>
                          {items.length===0 ? <Text style={{opacity:0.6}}>No activities</Text> : items.map(it=> (
                            <View key={it.id} style={styles.classRow}>
                              <View>
                                <Text style={{fontWeight:'600'}}>{it.name} ({it.code})</Text>
                                {(it.classDate || it.classMonth) ? <Text>{it.classDate || '-'} / {it.classMonth || '-'}</Text> : null}
                                <Text>{it.start} - {it.end} • {it.room}</Text>
                              </View>
                              <View style={{flexDirection:'row', alignItems:'center'}}>
                                <TouchableOpacity onPress={()=>openEdit(it)} style={[styles.rowBtn, {marginRight:8}]}><Text>Edit</Text></TouchableOpacity>
                                <TouchableOpacity onPress={()=>remove(it)} style={styles.del}><Text>Delete</Text></TouchableOpacity>
                              </View>
                            </View>
                          ))}
                        </View>
                      );
                    }} />
                    
                  </>
                ) : (
                  <>
                    <Text style={styles.header}>📚 Study Plan</Text>

                    {plans.length === 0 ? (
                      <Text style={styles.emptyText}>ยังไม่มีแผนการเรียน</Text>
                    ) : (
                      <FlatList
                        data={plans}
                        keyExtractor={item => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingBottom: 100 }}
                      />
                    )}
                  </>
                )}
              </View>

      <TouchableOpacity style={styles.fab} onPress={()=>{
        if(viewMode==='classes') openAdd();
        else if(viewMode==='study'){
          // prepare blank form
          setEditingPlanId(null);
          setSubject(''); setTopic(''); setDate(''); setTime('');
          setPlanModalVisible(true);
        }
      }} accessibilityLabel="Add">
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

    {/* activity modal (used for classes/exams) */}
    <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={()=>setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={{fontWeight:'700', marginBottom:8}}>{editingId? 'Edit Activity' : 'Add Activity'}</Text>
                <TextInput placeholder="Activity name" value={name} onChangeText={setName} style={styles.input} />
                
                <TextInput placeholder="Location" value={room} onChangeText={setRoom} style={styles.input} />
    
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
    
                <View style={{flexDirection:'row', marginTop:12, justifyContent:'space-between'}}>

                <Pressable 
                  style={[styles.modalBtn, {backgroundColor:'#ccc'}]} 
                  onPress={()=>{
                    setModalVisible(false); 
                    setEditingId(null);
                  }}
                >
                  <Text>Cancel</Text>
                </Pressable>

                <Pressable 
                  style={[styles.modalBtn,{backgroundColor:'#b96aa2'}]} 
                  onPress={addActivity}
                >
                  <Text style={{color:'#fff'}}>Save</Text>
                </Pressable>
              </View>
              </View>
            </View>
          </Modal>
          

    {/* study plan modal separate */}
    <Modal visible={planModalVisible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>{editingPlanId ? 'แก้ไขแผนการเรียน' : 'เพิ่มแผนการเรียน'}</Text>

          <TextInput
            placeholder="ชื่อวิชา"
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
          />

          <TextInput
            placeholder="หัวข้อที่อ่าน"
            style={styles.input}
            value={topic}
            onChangeText={setTopic}
          />

          <TextInput
            placeholder="วันที่ (เช่น 10/03/2026)"
            style={styles.input}
            value={date}
            onChangeText={setDate}
          />

          <TextInput
            placeholder="เวลา (เช่น 18:00 - 20:00)"
            style={styles.input}
            value={time}
            onChangeText={setTime}
          />

          <View style={styles.modalButtons}>
            <Pressable
              style={[styles.modalBtn, { backgroundColor: '#ccc' }]}
              onPress={() => {
                setPlanModalVisible(false);
                setEditingPlanId(null);
              }}
            >
              <Text>ยกเลิก</Text>
            </Pressable>

            <Pressable
              style={[styles.modalBtn, { backgroundColor: '#4CAF50' }]}
              onPress={addPlan}
            >
              <Text style={{ color: 'white' }}>บันทึก</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>

      <StatusBar style="auto" />
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
  emptyCard:{marginTop:16, padding:14, borderRadius:10, borderWidth:1, borderColor:'#f0dff0', backgroundColor:'#fff', alignItems:'center'},
  emptyTitle:{fontSize:16, fontWeight:'700', color:'#6b3550'},
  emptySub:{marginTop:4, fontSize:13, color:'#7f6b78', textAlign:'center'},
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
  ,checkbox:{width:20,height:20,borderWidth:1,borderColor:'#666',alignItems:'center',justifyContent:'center'}
  ,checkboxChecked:{backgroundColor:'#666'}

  // study plan styles
  ,emptyText:{textAlign:'center', marginTop:20, color:'#666'}
  ,card:{flexDirection:'row', justifyContent:'space-between', padding:12, borderWidth:1, borderColor:'#eee', borderRadius:8, marginVertical:6, backgroundColor:'#fff'}
  ,subject:{fontWeight:'700', fontSize:16}
  ,topic:{marginTop:4, color:'#444'}
  ,detail:{marginTop:2, fontSize:12, color:'#888'}
  ,deleteBtn:{backgroundColor:'#ffffff', padding:8, borderRadius:6}
  ,modalContainer:{flex:1, justifyContent:'center', backgroundColor:'rgba(0,0,0,0.4)'}
  ,modalBox:{backgroundColor:'#fff', margin:20, padding:16, borderRadius:8}
  ,modalTitle:{fontSize:18, fontWeight:'700', marginBottom:12}
  ,modalButtons:{flexDirection:'row', justifyContent:'space-between', marginTop:12}
});
