import { useUser } from '@/context/UserContext';
import { useSchoolStore } from '@/store/schoolStore';
import { AlertCircle, Bell, CheckCircle, Clock } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FEE_TABS = ['all', 'pending', 'overdue', 'paid'];

export default function ParentFees() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { getUser, getChildFees, getParentAnnouncements } = useSchoolStore();

  const child = getUser(user?.childId);
  const fees = getChildFees(user?.childId);
  const announcements = getParentAnnouncements(user?.schoolId);
  const [feeTab, setFeeTab] = useState('all');
  const [section, setSection] = useState('fees'); // 'fees' | 'announcements'

  const filteredFees = fees.filter((f) => feeTab === 'all' || f.status === feeTab);

  const totalDue = fees.filter((f) => f.status !== 'paid').reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = fees.filter((f) => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);

  const feeStatusConfig = {
    pending: { label: 'Pending', bg: '#FFF9C4', color: '#F57F17', icon: Clock },
    overdue: { label: 'Overdue', bg: '#FFEBEE', color: '#C62828', icon: AlertCircle },
    paid: { label: 'Paid', bg: '#E8F5E9', color: '#2E7D32', icon: CheckCircle },
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={{ backgroundColor: '#006064', paddingTop: insets.top + 16, paddingBottom: 20, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 2 }}>Fees & Announcements</Text>
        <Text style={{ color: '#80DEEA', fontSize: 13 }}>{child?.name} • {child?.rollNumber || 'Class ' + child?.classLevel}</Text>

        {/* Fee summary */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 12, alignItems: 'center' }}>
            <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 18 }}>Rs. {totalDue.toLocaleString()}</Text>
            <Text style={{ color: '#B2EBF2', fontSize: 11, marginTop: 2 }}>Amount Due</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 12, alignItems: 'center' }}>
            <Text style={{ color: '#A5D6A7', fontWeight: 'bold', fontSize: 18 }}>Rs. {totalPaid.toLocaleString()}</Text>
            <Text style={{ color: '#B2EBF2', fontSize: 11, marginTop: 2 }}>Paid This Year</Text>
          </View>
        </View>
      </View>

      {/* Section toggle */}
      <View style={{ flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#E0E0E0' }}>
        {[{ id: 'fees', label: 'Fee Challan' }, { id: 'announcements', label: `Announcements (${announcements.length})` }].map((tab) => (
          <TouchableOpacity key={tab.id} onPress={() => setSection(tab.id)}
            style={{ flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: section === tab.id ? '#006064' : 'transparent' }}>
            <Text style={{ color: section === tab.id ? '#006064' : '#9E9E9E', fontWeight: '700', fontSize: 13 }}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {section === 'fees' ? (
        <>
          {/* Fee filter tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            style={{ backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#F0F0F0', maxHeight: 50 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
            {FEE_TABS.map((tab) => {
              const count = tab === 'all' ? fees.length : fees.filter((f) => f.status === tab).length;
              return (
                <TouchableOpacity key={tab} onPress={() => setFeeTab(tab)}
                  style={{ paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, backgroundColor: feeTab === tab ? '#006064' : '#F5F5F5', borderWidth: 1, borderColor: feeTab === tab ? '#006064' : '#E0E0E0', flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                  <Text style={{ color: feeTab === tab ? '#FFF' : '#424242', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' }}>{tab}</Text>
                  <Text style={{ color: feeTab === tab ? '#FFD700' : '#9E9E9E', fontSize: 11 }}>({count})</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}>
            {filteredFees.length === 0 ? (
              <View style={{ paddingVertical: 60, alignItems: 'center' }}>
                <CheckCircle size={48} color="#E0E0E0" />
                <Text style={{ color: '#9E9E9E', fontSize: 15, marginTop: 16 }}>No {feeTab} fees</Text>
              </View>
            ) : (
              filteredFees.slice().sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).map((fee) => {
                const sc = feeStatusConfig[fee.status];
                const Icon = sc.icon;
                const isOverdue = fee.status === 'overdue';
                return (
                  <View key={fee.id} style={{ backgroundColor: '#FFF', borderRadius: 14, padding: 18, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2, borderLeftWidth: 4, borderLeftColor: sc.color }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '700', color: '#1A237E', fontSize: 16 }}>{fee.title}</Text>
                        <Text style={{ color: '#757575', fontSize: 13, marginTop: 2 }}>{fee.month}</Text>
                      </View>
                      <View style={{ backgroundColor: sc.bg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Icon size={13} color={sc.color} />
                        <Text style={{ color: sc.color, fontSize: 12, fontWeight: '700' }}>{sc.label}</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                      <View>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: isOverdue ? '#C62828' : '#1A237E' }}>
                          Rs. {fee.amount.toLocaleString()}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                          <Clock size={12} color="#9E9E9E" />
                          <Text style={{ fontSize: 12, color: isOverdue ? '#C62828' : '#9E9E9E', fontWeight: isOverdue ? '600' : '400' }}>
                            {fee.status === 'paid'
                              ? `Paid on ${new Date(fee.paidOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                              : `Due: ${new Date(fee.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                            }
                          </Text>
                        </View>
                      </View>
                      {fee.status !== 'paid' && (
                        <View style={{ backgroundColor: isOverdue ? '#FFEBEE' : '#E0F7FA', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 }}>
                          <Text style={{ color: isOverdue ? '#C62828' : '#006064', fontSize: 12, fontWeight: '700' }}>
                            {isOverdue ? 'PAY NOW' : 'DUE SOON'}
                          </Text>
                        </View>
                      )}
                    </View>

                    {fee.status === 'paid' && (
                      <View style={{ marginTop: 10, backgroundColor: '#E8F5E9', borderRadius: 8, padding: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <CheckCircle size={14} color="#2E7D32" />
                        <Text style={{ color: '#2E7D32', fontSize: 12, fontWeight: '600' }}>Payment received — Thank you!</Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>
        </>
      ) : (
        /* Announcements tab */
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}>
          {announcements.length === 0 ? (
            <View style={{ paddingVertical: 60, alignItems: 'center' }}>
              <Bell size={48} color="#E0E0E0" />
              <Text style={{ color: '#9E9E9E', fontSize: 15, marginTop: 16 }}>No announcements for parents yet</Text>
            </View>
          ) : (
            announcements.slice().reverse().map((ann) => (
              <View key={ann.id} style={{ backgroundColor: '#FFF', borderRadius: 14, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#FFD700', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
                <Text style={{ fontWeight: '700', color: '#1A237E', fontSize: 16, marginBottom: 8 }}>{ann.title}</Text>
                <Text style={{ color: '#424242', fontSize: 14, lineHeight: 22 }}>{ann.content}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <Text style={{ color: '#9E9E9E', fontSize: 12 }}>
                    {new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </Text>
                  <Text style={{ color: '#757575', fontSize: 12 }}>— {ann.postedByName}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
