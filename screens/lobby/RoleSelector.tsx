import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '../../components/Button';
import { Role } from '../../types';
import { styles } from './styles';

interface RoleSelectorProps {
    myRole: Role;
    onRoleChange: (role: Role) => void;
}

export function RoleSelector({ myRole, onRoleChange }: RoleSelectorProps) {
    return (
        <View style={styles.roleSelection}>
            <Text style={styles.sectionTitle}>Wähle deine Rolle</Text>
            <View style={styles.roleButtons}>
                <Button
                    variant={myRole === 'display' ? 'primary' : 'secondary'}
                    onPress={() => onRoleChange('display')}
                    style={{ flex: 1 }}
                >
                    Display
                </Button>
                <Button
                    variant={myRole === 'controller' ? 'primary' : 'secondary'}
                    onPress={() => onRoleChange('controller')}
                    style={{ flex: 1 }}
                >
                    Controller
                </Button>
            </View>
        </View>
    );
}
